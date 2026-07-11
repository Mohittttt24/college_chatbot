# Why this file is written:
# This router defines the API endpoint for the session-based AI Chatbot.
# It exposes a POST /chat endpoint which receives a query and session_id,
# passes it to the AiService to manage memory (ChatMessageHistory) and generate responses.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import schemas, services, and dependencies
from schemas.chatbot import ChatRequest, ChatResponse, ChatHistoryResponse
from services.ai_service import AiService
from dependencies import get_db, get_optional_current_user
from models.chat_history import ChatHistory
from models.user import User

router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

# Instantiate AiService
ai_service = AiService()

@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def send_chat_message(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_optional_current_user)):
    """
    Submits a message to the chatbot. Retrieves history for the session_id, 
    passes it to the LLM (Groq), appends the response to memory, and returns the response.
    
    Inputs:
        payload (ChatRequest): session_id and user message text.
        db (Session): Database session.
        current_user (User, optional): User object if authenticated.
        
    Outputs:
        ChatResponse: Session ID and the generated AI reply text.
        
    Flow:
        1. Forward request to AiService.
        2. AiService loads session chat history from PostgreSQL.
        3. Invokes Groq LLM chain.
        4. Saves user message and AI response back to PostgreSQL chat logs.
        5. Returns response.
    """
    try:
        user_id = current_user.id if current_user else None
        
        # Call AiService to process the conversational chain
        response_text = ai_service.generate_chatbot_response(
            session_id=payload.session_id,
            message=payload.message,
            db=db,
            user_id=user_id
        )
        
        return ChatResponse(
            session_id=payload.session_id,
            response=response_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot failed to process message: {str(e)}"
        )

@router.get("/history/{session_id}", response_model=List[ChatHistoryResponse])
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves historical chat logs for a specific session ID.
    
    Inputs:
        session_id (str): The session identifier.
        db (Session): Database session.
        
    Outputs:
        List[ChatHistoryResponse]: Chronological list of user messages and AI replies.
    """
    logs = db.query(ChatHistory).filter(ChatHistory.session_id == session_id).order_by(ChatHistory.created_at.asc()).all()
    return logs
