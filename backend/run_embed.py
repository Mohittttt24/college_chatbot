# Run this script using:
# .venv\Scripts\python run_embed.py

import sys
import os

# Import models to register with SQLAlchemy
from models.user import User
from models.document import Document
from models.faq import FAQ
from models.chat_history import ChatHistory

from database import SessionLocal
from services.document_service import DocumentService
from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService
from config import settings

db = SessionLocal()
qdrant_service = QdrantService()
embedding_service = EmbeddingService()

try:
    documents = db.query(Document).all()
    print(f"Found {len(documents)} documents in PostgreSQL.")

    chunk_size = 500
    chunk_overlap = 50
    total_chunks = 0

    for doc in documents:
        try:
            print(f"Processing document: {doc.filename} (ID: {doc.id})")
            text = DocumentService.extract_text(doc.s3_key)
            if not text.strip():
                print(f"No text extracted from {doc.filename}")
                continue
                
            # Split text into chunks
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunks.append(text[start:end])
                start += chunk_size - chunk_overlap
                
            print(f"Generated {len(chunks)} chunks.")
            
            # Generate embeddings
            embeddings = embedding_service.embed_texts(chunks)
            
            # Upload chunks and vectors into Qdrant
            uploaded_count = qdrant_service.upsert_chunks(
                name=settings.QDRANT_COLLECTION_NAME,
                texts=chunks,
                embeddings=embeddings,
                document_id=doc.id,
                filename=doc.filename
            )
            total_chunks += uploaded_count
            print(f"Uploaded {uploaded_count} chunks to Qdrant.")
        except Exception as e:
            print(f"Error processing {doc.filename}: {str(e)}")

    print(f"\nEmbedding completed successfully! Total chunks processed: {total_chunks}")
finally:
    db.close()
