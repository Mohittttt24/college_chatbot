# Why this file is written:
# This file defines the SQLAlchemy database model for 'ChatHistory'.
# It maps the Python ChatHistory class to the database table 'chat_histories' in PostgreSQL.
# It is used to store user conversations (session-based) so the AI chatbot can
# retrieve past context and history to maintain conversational memory (e.g. session-based memory).

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Import the Base class from database.py
from database import Base

class ChatHistory(Base):
    """
    SQLAlchemy Model representing the 'chat_histories' table in PostgreSQL.
    Stores chat transcripts keyed by a session_id and optionally linked to a specific user.
    """
    __tablename__ = "chat_histories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), index=True, nullable=False)      # Group messages belonging to the same session
    user_message = Column(Text, nullable=False)                        # The query input from the user
    ai_response = Column(Text, nullable=False)                         # The reply output from the AI
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Optional: Associate chat history with a logged-in user account
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="chat_histories")

    def __repr__(self):
        return f"<ChatHistory Session={self.session_id} Msg={self.user_message[:20]}>"
