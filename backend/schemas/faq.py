# Why this file is written:
# This file defines the Pydantic validation schemas for FAQ (Frequently Asked Questions).
# These schemas validate parameters when creating, updating, or returning FAQ entries,
# securing the API endpoints and providing automated Swagger documentation.

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ----------------------------------------------------
# Base Schema (Shared attributes)
# ----------------------------------------------------
class FAQBase(BaseModel):
    """
    Base schema for FAQ holding common fields.
    """
    question: str = Field(..., max_length=500, description="The Frequently Asked Question text")
    answer: str = Field(..., description="The descriptive answer to the question")
    category: Optional[str] = Field(None, max_length=100, description="Category tag (e.g. fees, hostel, syllabus)")

# ----------------------------------------------------
# Request Schemas (API Inputs)
# ----------------------------------------------------
class FAQCreate(FAQBase):
    """
    Schema for creating a new FAQ entry via Admin interfaces.
    Inherits all base fields as mandatory input requirements.
    """
    pass

class FAQUpdate(BaseModel):
    """
    Schema for updating an existing FAQ entry.
    All fields are optional to support partial updates (PATCH).
    """
    question: Optional[str] = Field(None, max_length=500)
    answer: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)

# ----------------------------------------------------
# Response Schemas (API Outputs)
# ----------------------------------------------------
class FAQResponse(FAQBase):
    """
    Schema for returning FAQ details to API clients.
    Adds primary key and metadata audit fields.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # ConfigDict allows Pydantic to parse SQLAlchemy models directly
    model_config = ConfigDict(from_attributes=True)
