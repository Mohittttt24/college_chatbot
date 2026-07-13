# Why this file is written:
# This file defines the Pydantic schemas (V2) for User authentication and profiles.
# Pydantic schemas validate request payloads (inputs) and serialize database objects (outputs)
# into clean, standardized JSON structures. This guarantees security and correctness in API calls.

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional
from datetime import datetime

# ----------------------------------------------------
# Base Schema (Shared attributes)
# ----------------------------------------------------
class UserBase(BaseModel):
    """
    Pydantic base schema for users. Includes attributes shared
    across registration, logins, and API responses.
    """
    email: EmailStr
    full_name: Optional[str] = None
    is_admin: Optional[bool] = False

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if any(char.isdigit() for char in v):
                raise ValueError("Name cannot contain numeric values.")
        return v

# ----------------------------------------------------
# Request Schemas (API Inputs)
# ----------------------------------------------------
class UserCreate(UserBase):
    """
    Schema for User Registration request payload.
    Adds a mandatory password field.
    """
    password: str

class UserLogin(BaseModel):
    """
    Schema for User Login request payload.
    Contains credentials to fetch JWT token.
    """
    email: EmailStr
    password: str

# ----------------------------------------------------
# Response Schemas (API Outputs)
# ----------------------------------------------------
class UserResponse(UserBase):
    """
    Schema for returning User Profile data to the client.
    Excludes sensitive fields like hashed password.
    """
    id: int
    is_active: bool
    created_at: datetime

    # ConfigDict tells Pydantic V2 to automatically parse SQLAlchemy database models
    # directly into this schema (formerly class Config: orm_mode = True)
    model_config = ConfigDict(from_attributes=True)

# ----------------------------------------------------
# JWT Token Schemas
# ----------------------------------------------------
class Token(BaseModel):
    """
    Schema for returning the access token and type after successful login.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Schema representing the payload stored inside the encrypted JWT token.
    Used for verifying identity in protected dependency checks.
    """
    email: Optional[str] = None
    is_admin: Optional[bool] = False
