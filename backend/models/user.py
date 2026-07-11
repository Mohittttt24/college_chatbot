# Why this file is written:
# This file defines the SQLAlchemy database model for 'User'.
# It maps the Python User class to the database table 'users', allowing us to
# create, read, update, and delete user records using Python objects (ORM).
# It is used for handling user registration, login, and authentication details.

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Import the Base class from database.py (which will be created at the backend root)
# All SQLAlchemy models must inherit from this Base class to be registered.
from database import Base

class User(Base):
    """
    SQLAlchemy Model representing the 'users' table in PostgreSQL.
    Stores registered user details and credentials.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Admin users will have permission to upload/manage documents
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # One user can upload multiple documents (if admin) or have multiple chat history logs.
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
