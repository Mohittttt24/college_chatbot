# Why this file is written:
# This service integrates the Groq LLM using LangChain.
# It handles prompt construction for both general chatbot queries (with PostgreSQL conversation memory)
# and RAG queries (where the LLM answers strictly using matching document context).
# Storing history directly in PostgreSQL ensures user memory persists between server restarts.

from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import Optional, List, Dict, Any

# Import configs, templates, and database models
from config import settings
from utils.prompt_templates import CHATBOT_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT
from models.chat_history import ChatHistory

class AiService:
    """
    AI Service coordinating LLM interactions via LangChain Groq.
    """

    def __init__(self):
        """
        Initialize the Groq Chat model with configurations.
        """
        # Connects to Groq API services. We use the llama3-8b-8192 model
        # which is fast, accurate, and suitable for RAG context extraction.
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name="llama3-8b-8192",
            temperature=0.2  # Lower temperature makes the model more deterministic and less likely to hallucinate
        )

    def generate_chatbot_response(self, session_id: str, message: str, db: Session, user_id: Optional[int] = None) -> str:
        """
        Generates a conversational AI response using previous session chat logs stored in PostgreSQL.
        
        Inputs:
            session_id (str): ID of the current chat thread.
            message (str): User's query input.
            db (Session): Database transaction session.
            user_id (int, optional): ID of the user if logged in.
            
        Outputs:
            str: AI text reply.
            
        Flow:
            1. Fetch all previous messages in this session ordered by date.
            2. Build the LangChain prompt template including system prompt, history blocks, and query.
            3. Call Groq API.
            4. Save the user input and AI response as a new ChatHistory record.
            5. Return response text.
        """
        # 1. Retrieve history from PostgreSQL database
        past_records = db.query(ChatHistory).filter(ChatHistory.session_id == session_id).order_by(ChatHistory.created_at.asc()).all()
        
        # 2. Build history payload list compatible with LangChain ChatPromptTemplate
        history_messages = []
        for record in past_records:
            history_messages.append(("human", record.user_message))
            history_messages.append(("ai", record.ai_response))
            
        # 3. Create the prompt structure
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", CHATBOT_SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])
        
        # 4. Invoke LLM chain
        chain = prompt_template | self.llm
        result = chain.invoke({
            "history": history_messages,
            "input": message
        })
        
        ai_reply = result.content

        # 5. Persist this turn to PostgreSQL for future memory lookups
        chat_log = ChatHistory(
            session_id=session_id,
            user_message=message,
            ai_response=ai_reply,
            user_id=user_id
        )
        db.add(chat_log)
        db.commit()

        return ai_reply

    def generate_rag_response(self, question: str, context: str, session_id: Optional[str] = None) -> str:
        """
        Generates a grounded answer based strictly on the retrieved context document text.
        
        Inputs:
            question (str): User question.
            context (str): Context snippets retrieved from Qdrant.
            session_id (str, optional): Optional session ID.
            
        Outputs:
            str: AI answer text.
        """
        # Create prompt using template defined in utils/prompt_templates.py
        prompt_template = ChatPromptTemplate.from_template(RAG_SYSTEM_PROMPT)
        chain = prompt_template | self.llm
        
        result = chain.invoke({
            "context": context,
            "question": question
        })
        
        return result.content
