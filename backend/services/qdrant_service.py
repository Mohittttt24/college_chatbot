# Why this file is written:
# This service interacts with the Qdrant Cloud vector database.
# It handles checking for collections, creating new collections with 384 dimensions (Cosine similarity),
# upserting text chunk vectors, deleting indexed documents, and searching similar documents for context retrieval.

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from typing import List, Dict, Any
import uuid

# Import configurations
from config import settings

class QdrantService:
    """
    Service layer interacting directly with the Qdrant Client to manage vector stores.
    """

    _client = None

    def __init__(self):
        """
        Initialize the QdrantClient connection using configurations.
        """
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    @property
    def client(self) -> QdrantClient:
        if QdrantService._client is None:
            qdrant_url = settings.QDRANT_URL
            
            # Check if URL is placeholder
            if not qdrant_url or "your-qdrant-cluster-url" in qdrant_url:
                QdrantService._client = QdrantClient(path="./qdrant_local_db")
            else:
                try:
                    # Try connecting to the specified remote/local server
                    QdrantService._client = QdrantClient(
                        url=qdrant_url,
                        api_key=settings.QDRANT_API_KEY,
                        timeout=2.0
                    )
                    # Quick check to see if server is responsive
                    QdrantService._client.get_collections()
                except Exception:
                    # Fallback to local persistent disk storage
                    QdrantService._client = QdrantClient(path="./qdrant_local_db")
        return QdrantService._client

    def collection_exists(self, name: str) -> bool:
        """
        Checks if a collection exists inside Qdrant.
        
        Inputs:
            name (str): Collection name to check.
            
        Outputs:
            bool: True if collection exists, False otherwise.
        """
        try:
            collections = self.client.get_collections()
            exist_names = [col.name for col in collections.collections]
            return name in exist_names
        except Exception:
            return False

    def create_collection(self, name: str) -> bool:
        """
        Creates a new collection in Qdrant configured for 384 dimensions and Cosine similarity.
        
        Inputs:
            name (str): Collection name to create.
            
        Outputs:
            bool: True if created successfully, False otherwise.
        """
        try:
            # We configure 384 dimensions because BAAI/bge-small-en-v1.5 outputs 384-dimensional vectors.
            # Cosine similarity is the recommended distance metric for this model.
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            return True
        except Exception:
            return False

    def ensure_collection(self, name: str):
        """
        Ensures the collection exists. If not, it creates it automatically.
        """
        if not self.collection_exists(name):
            self.create_collection(name)

    def upsert_chunks(self, name: str, texts: List[str], embeddings: List[List[float]], document_id: int, filename: str) -> int:
        """
        Upserts multiple text chunks and their vectors into Qdrant.
        
        Inputs:
            name (str): Collection name.
            texts (List[str]): List of parsed text paragraph chunks.
            embeddings (List[List[float]]): List of generated 384-dim vector embeddings.
            document_id (int): PostgreSQL ID of the document (metadata).
            filename (str): Name of the source file (metadata).
            
        Outputs:
            int: Number of points successfully upserted.
            
        Flow:
            1. Validate lists match in length.
            2. Build Qdrant PointStruct array including payload metadata.
            3. Upsert points to the Qdrant collection.
        """
        if len(texts) != len(embeddings):
            raise ValueError("The number of text chunks and embeddings must be identical.")
            
        self.ensure_collection(name)
        
        points = []
        for index, (text, vector) in enumerate(zip(texts, embeddings)):
            point_id = str(uuid.uuid4())  # Generate a unique UUID for each chunk point
            
            # Payload stores metadata. This metadata is retrieved along with vectors during searches.
            payload = {
                "text": text,
                "document_id": document_id,
                "filename": filename,
                "chunk_index": index
            }
            
            points.append(PointStruct(id=point_id, vector=vector, payload=payload))
            
        self.client.upsert(collection_name=name, points=points)
        return len(points)

    def delete_by_document_id(self, name: str, document_id: int) -> bool:
        """
        Deletes all vector points associated with a specific document ID.
        Used when an admin deletes a document from S3 and PostgreSQL.
        
        Inputs:
            name (str): Collection name.
            document_id (int): Database ID of the document to purge.
            
        Outputs:
            bool: True if deletion command was sent, False on exception.
        """
        try:
            # We filter points matching the metadata payload attribute 'document_id'
            self.client.delete(
                collection_name=name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=document_id)
                        )
                    ]
                )
            )
            return True
        except Exception:
            return False

    def search_similarity(self, name: str, query_vector: List[float], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Searches Qdrant for vector points closest to the query vector.
        
        Inputs:
            name (str): Collection name.
            query_vector (List[float]): Generated vector of the user query.
            top_k (int): Number of matches to fetch.
            
        Outputs:
            List[Dict[str, Any]]: List of matching dicts containing scores and text payload.
        """
        self.ensure_collection(name)
        
        search_results = self.client.query_points(
            collection_name=name,
            query=query_vector,
            limit=top_k
        )
        
        results = []
        for result in search_results.points:
            results.append({
                "text": result.payload.get("text", ""),
                "score": result.score,
                "filename": result.payload.get("filename", "unknown"),
                "document_id": result.payload.get("document_id")
            })
            
        return results
