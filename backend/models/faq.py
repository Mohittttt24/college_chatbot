# Why this file is written:
# This file defines the SQLAlchemy database model for 'FAQ'.
# It maps the Python FAQ class to the database table 'faqs'.
# Predefined FAQ entries represent standard, static questions and answers (e.g., college hours, hostel address)
# that can be quickly fetched from the relational database without necessarily querying the RAG vector space.

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

# Import the Base class from database.py
from database import Base

class FAQ(Base):
    """
    SQLAlchemy Model representing the 'faqs' table in PostgreSQL.
    Stores standard static FAQs for the college.
    """
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(500), unique=True, index=True, nullable=False)  # The FAQ question (e.g., "What are the college timings?")
    answer = Column(Text, nullable=False)                                     # The answer to the FAQ question
    category = Column(String(100), index=True, nullable=True)                # Category classification (e.g., "hostel", "fees", "rules", "general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FAQ {self.question[:30]}...>"
