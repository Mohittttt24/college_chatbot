# Why this file is written:
# This file defines the SQLAlchemy database model for 'Document'.
# It maps the Python Document class to the database table 'documents' in PostgreSQL.
# It is used to keep track of files uploaded to AWS S3 (like syllabus PDFs, fee charts, etc.)
# so we can associate them with users, retrieve their download URLs, and manage deletion.

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Import the Base class from database.py
from database import Base

class Document(Base):
    """
    SQLAlchemy Model representing the 'documents' table in PostgreSQL.
    Tracks uploaded PDF/Docx files, S3 paths, and which administrator uploaded them.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)                     # Name of the uploaded file (e.g., "hostel_rules.pdf")
    s3_key = Column(String(500), unique=True, nullable=False)          # Unique path/key of the file stored in S3
    file_url = Column(String(1000), nullable=False)                     # Public URL or signed URL to access the file
    file_size = Column(Integer, nullable=True)                         # Size of the file in bytes
    content_type = Column(String(100), nullable=True)                  # MIME type (e.g., "application/pdf")
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key referencing the user who uploaded the document
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="documents")

    def __repr__(self):
        return f"<Document {self.filename}>"
