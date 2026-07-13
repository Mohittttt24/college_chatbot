"""
Re-embed all documents with larger chunk size (1500 chars, 200 overlap)
so that lists like HODs/departments are not split across too many tiny chunks.
"""
import sys
sys.path.insert(0, ".")
from models.user import User
from models.document import Document
from models.chat_history import ChatHistory
from models.faq import FAQ
from database import SessionLocal
from services.document_service import DocumentService
from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService
from config import settings

CHUNK_SIZE = 1500     # Larger chunks = more complete information per chunk
CHUNK_OVERLAP = 200   # More overlap = less chance of cutting a list mid-way

db = SessionLocal()
docs = db.query(Document).all()
print(f"Documents to re-embed: {len(docs)}")

embedding_service = EmbeddingService()
qdrant_service = QdrantService()

# Delete existing collection and recreate to avoid duplicate/stale vectors
try:
    qdrant_service.client.delete_collection(settings.QDRANT_COLLECTION_NAME)
    print(f"Deleted old collection: {settings.QDRANT_COLLECTION_NAME}")
except Exception as e:
    print(f"Could not delete collection (may not exist yet): {e}")

total = 0
for doc in docs:
    print(f"\nProcessing: {doc.filename}")
    try:
        text = DocumentService.extract_text(doc.s3_key)
        print(f"  Extracted {len(text)} characters")
        if not text.strip():
            print("  Empty — skipping.")
            continue

        # Chunk with larger window
        chunks = []
        start = 0
        while start < len(text):
            end = start + CHUNK_SIZE
            chunks.append(text[start:end])
            start += CHUNK_SIZE - CHUNK_OVERLAP

        print(f"  Split into {len(chunks)} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")

        embeddings = embedding_service.embed_texts(chunks)
        count = qdrant_service.upsert_chunks(
            name=settings.QDRANT_COLLECTION_NAME,
            texts=chunks,
            embeddings=embeddings,
            document_id=doc.id,
            filename=doc.filename
        )
        total += count
        print(f"  Upserted {count} vectors")
    except Exception as e:
        import traceback
        print(f"  ERROR: {e}")
        traceback.print_exc()

print(f"\nDone. Total vectors indexed: {total}")
db.close()
