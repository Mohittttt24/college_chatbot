# Why this file is written:
# This router defines the API endpoints for the Retrieval-Augmented Generation (RAG) system.
# It exposes endpoints for embedding documents (/embed), performing similarity vector searches (/search),
# and executing full RAG question-answering (/ask) using Groq and Qdrant.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import schemas, services, and database dependencies
from schemas.rag import RagQueryRequest, RagAskRequest, RagResponse, SearchResultSource, EmbedStatusResponse
from services.rag_service import RagService
from services.qdrant_service import QdrantService
from services.embedding_service import EmbeddingService
from services.document_service import DocumentService
from dependencies import get_db, get_current_admin_user
from models.document import Document
from config import settings

router = APIRouter(
    prefix="/rag",
    tags=["RAG (Retrieval-Augmented Generation)"]
)

# Instantiate RAG pipeline services
rag_service = RagService()
qdrant_service = QdrantService()
embedding_service = EmbeddingService()

@router.post("/embed", response_model=EmbedStatusResponse, status_code=status.HTTP_200_OK)
def embed_all_documents(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """
    Ingests and embeds all text documents currently stored in PostgreSQL/S3 into Qdrant.
    
    Inputs:
        db (Session): Database session.
        current_user: Admin authentication check dependency.
        
    Outputs:
        EmbedStatusResponse: Status message and the number of chunks processed.
        
    Flow:
        1. Fetch all documents from PostgreSQL.
        2. For each document, download/parse text using DocumentService.
        3. Split the text into manageable chunks.
        4. Generate 384-dimensional vectors using EmbeddingService.
        5. Upload chunks and vectors into Qdrant.
    """
    documents = db.query(Document).all()
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No documents found in the database to embed."
        )
        
    total_chunks = 0
    # Simple chunking parameters (e.g. 500 chars window, 50 overlap)
    chunk_size = 500
    chunk_overlap = 50
    
    for doc in documents:
        try:
            # Note: For S3, you would fetch/download the file locally first.
            # For simplicity, if we store the file path locally or download from URL, we parse it.
            # Assuming file_path is s3_key or local path stored in s3_key
            text = DocumentService.extract_text(doc.s3_key)
            if not text.strip():
                continue
                
            # Simple text splitting logic (fallback if text_splitter is not loaded)
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunks.append(text[start:end])
                start += chunk_size - chunk_overlap
                
            # Generate embeddings
            embeddings = embedding_service.embed_texts(chunks)
            
            # Upsert into Qdrant
            uploaded_count = qdrant_service.upsert_chunks(
                name=settings.QDRANT_COLLECTION_NAME,
                texts=chunks,
                embeddings=embeddings,
                document_id=doc.id,
                filename=doc.filename
            )
            total_chunks += uploaded_count
            
        except Exception as e:
            # Continue to next file if one fails, but print/log the error
            print(f"Error embedding document {doc.filename}: {str(e)}")
            continue
            
    return EmbedStatusResponse(
        status="success",
        embedded_chunks_count=total_chunks
    )

@router.post("/search", response_model=List[SearchResultSource], status_code=status.HTTP_200_OK)
def search_similar_documents(payload: RagQueryRequest):
    """
    Performs a raw semantic similarity search against the Qdrant vector database.
    
    Inputs:
        payload (RagQueryRequest): The search query and optional top_k.
        
    Outputs:
        List[SearchResultSource]: List of matching text snippets with cosine scores.
    """
    try:
        query_vector = embedding_service.embed_query(payload.query)
        results = qdrant_service.search_similarity(
            name=settings.QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            top_k=payload.top_k
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Qdrant vector search failed: {str(e)}"
        )

@router.post("/ask", response_model=RagResponse, status_code=status.HTTP_200_OK)
def ask_question(payload: RagAskRequest):
    """
    Executes a complete RAG workflow: queries Qdrant, retrieves context, 
    feeds it to Groq LLM, and returns the answer with cited sources.
    
    Inputs:
        payload (RagAskRequest): User question and optional session ID for memory.
        
    Outputs:
        RagResponse: AI answer text and the source snippets list.
    """
    try:
        response = rag_service.ask(
            question=payload.question,
            session_id=payload.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG QA pipeline failed: {str(e)}"
        )
