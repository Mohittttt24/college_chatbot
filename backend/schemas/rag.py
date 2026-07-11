# Why this file is written:
# This file defines the Pydantic validation schemas for the RAG (Retrieval-Augmented Generation) module.
# It validates inputs for semantic searches and QA queries, and structures the AI-generated answers
# along with references to source documents (like page snippets, filenames, and scores) for transparency.

from pydantic import BaseModel, Field
from typing import List, Optional

# ----------------------------------------------------
# Request Schemas (API Inputs)
# ----------------------------------------------------
class RagQueryRequest(BaseModel):
    """
    Schema for a simple semantic vector search query.
    """
    query: str = Field(..., min_length=1, description="The search term or topic (e.g. 'attendance requirements')")
    top_k: Optional[int] = Field(3, ge=1, le=10, description="Number of matches to return (default 3)")

class RagAskRequest(BaseModel):
    """
    Schema for a full Retrieval-Augmented Generation (RAG) QA prompt.
    """
    question: str = Field(..., min_length=1, description="The question text to ask the AI (e.g. 'What is the hostel fee?')")
    session_id: Optional[str] = Field(None, description="Optional chat session ID to use previous conversation memory")

# ----------------------------------------------------
# Response Schemas (API Outputs)
# ----------------------------------------------------
class EmbedStatusResponse(BaseModel):
    """
    Response schema after running a database embedding indexing process.
    """
    status: str = Field(..., description="Success or warning message status")
    embedded_chunks_count: int = Field(..., description="Number of text chunks embedded and saved to Qdrant")

class SearchResultSource(BaseModel):
    """
    Schema representing a single context chunk retrieved from the Qdrant database.
    """
    text: str = Field(..., description="The parsed text snippet matching the query")
    score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    filename: str = Field(..., description="Source filename (e.g. 'academic_calendar.pdf')")
    document_id: Optional[int] = Field(None, description="Database reference key of the source document")

class RagResponse(BaseModel):
    """
    Schema for returning AI-generated answers combined with cited document snippets.
    """
    answer: str = Field(..., description="The generated response text from the LLM based on source documents")
    sources: List[SearchResultSource] = Field(..., description="List of source document snippets used as context for the answer")
