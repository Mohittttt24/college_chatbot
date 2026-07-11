# Why this file is written:
# This file defines the Pydantic validation schemas for the Document module.
# It ensures document metadata stored in PostgreSQL (such as S3 URLs and file attributes)
# is cleanly validated and serialized when admins upload, delete, or list files.

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ----------------------------------------------------
# Base Schema (Shared attributes)
# ----------------------------------------------------
class DocumentBase(BaseModel):
    """
    Base schema containing basic metadata for an uploaded document.
    """
    filename: str = Field(..., description="Name of the file uploaded (e.g. hostel_rules.pdf)")
    file_url: str = Field(..., description="Access URL of the file stored in S3")
    file_size: Optional[int] = Field(None, description="Size of the file in bytes")
    content_type: Optional[str] = Field(None, description="MIME type of the file (e.g. application/pdf)")

# ----------------------------------------------------
# Request Schemas (API Inputs)
# ----------------------------------------------------
class DocumentCreate(DocumentBase):
    """
    Schema used internally by the upload service when registering a new file in the database.
    Adds the S3 storage key and owner user ID.
    """
    s3_key: str = Field(..., description="Unique S3 Object Key path")
    user_id: int = Field(..., description="The ID of the admin user who uploaded this document")

# ----------------------------------------------------
# Response Schemas (API Outputs)
# ----------------------------------------------------
class DocumentResponse(DocumentBase):
    """
    Schema for returning document upload results and lists to client apps.
    Adds ID, upload date, and creator metadata.
    """
    id: int
    uploaded_at: datetime
    user_id: int

    # ConfigDict forces Pydantic V2 to automatically parse SQLAlchemy ORM objects
    model_config = ConfigDict(from_attributes=True)
