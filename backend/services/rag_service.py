# Why this file is written:
# This service orchestrates the entire Retrieval-Augmented Generation (RAG) pipeline.
# It uses the EmbeddingService to convert a student's question into a vector,
# searches Qdrant via QdrantService to retrieve the most similar college document snippets,
# feeds this matching context into the AiService, and returns a verified AI response with source citations.

from typing import List, Dict, Any, Optional

# Import other services
from services.qdrant_service import QdrantService
from services.embedding_service import EmbeddingService
from services.ai_service import AiService
from config import settings

class RagService:
    """
    Orchestration service combining Vector Search (Qdrant) and LLM Completion (Groq) for RAG.
    """

    def __init__(self):
        """
        Initialize component services.
        """
        self.qdrant_service = QdrantService()
        self.embedding_service = EmbeddingService()
        self.ai_service = AiService()
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    def ask(self, question: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes a user question through the RAG pipeline.
        
        Inputs:
            question (str): The question asked by the user.
            session_id (str, optional): Session ID for chatbot memory tracking.
            
        Outputs:
            Dict[str, Any]: A dictionary containing the 'answer' string and a list of 'sources'.
            
        Flow:
            1. Generate vector embedding for the user's question using FastEmbed.
            2. Query Qdrant to find the top-K matching text snippets from college documents.
            3. Combine the retrieved snippets into a single context block.
            4. If no snippets are found, set context to a blank state.
            5. Forward the context and question to Groq LLM via AiService to generate a grounded reply.
            6. Return the generated answer alongside source details.
        """
        # Step 1: Embed the user's question
        query_vector = self.embedding_service.embed_query(question)
        
        # Step 2: Query Qdrant vector database for matching snippets
        # top_k defaults to 3 (as defined in config)
        top_k = settings.RAG_TOP_K
        search_results = self.qdrant_service.search_similarity(
            name=self.collection_name, 
            query_vector=query_vector, 
            top_k=top_k
        )
        
        # Step 3: Combine matching snippets to build the prompt context
        context_snippets = []
        sources = []
        
        for result in search_results:
            context_snippets.append(result["text"])
            sources.append({
                "text": result["text"],
                "score": result["score"],
                "filename": result["filename"],
                "document_id": result["document_id"]
            })
            
        context = "\n\n---\n\n".join(context_snippets) if context_snippets else "No relevant document context found."

        # Step 4: Generate grounded AI response using the retrieved context
        answer = self.ai_service.generate_rag_response(
            question=question,
            context=context,
            session_id=session_id
        )

        return {
            "answer": answer,
            "sources": sources
        }
