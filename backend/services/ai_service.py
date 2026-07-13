# Why this file is written:
# This service integrates the Groq LLM using LangChain.
# It handles prompt construction for both general chatbot queries (with PostgreSQL conversation memory)
# and RAG queries (where the LLM answers strictly using matching document context).
# Storing history directly in PostgreSQL ensures user memory persists between server restarts.

from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
# pyrefly: ignore [missing-import]
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import Optional, List, Dict, Any

# Import configs, templates, and database models
from config import settings
from utils.prompt_templates import CHATBOT_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT
from models.chat_history import ChatHistory
import requests
from html.parser import HTMLParser
from urllib.parse import urlparse, parse_qs

class DDGHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.results = []
        self.current_result = None
        self.in_title = False
        self.in_snippet = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")

        if tag == "div" and "result" in cls and "results_links" in cls:
            self.current_result = {"title": "", "snippet": "", "link": ""}

        elif tag == "a" and "result__url" in cls:
            self.in_title = True
            if self.current_result:
                href = attrs_dict.get("href", "")
                if "uddg=" in href:
                    try:
                        parsed_link = urlparse(href)
                        actual_url = parse_qs(parsed_link.query).get("uddg", [href])[0]
                        href = actual_url
                    except Exception:
                        pass
                self.current_result["link"] = href

        elif tag == "a" and "result__snippet" in cls:
            self.in_snippet = True

    def handle_endtag(self, tag):
        if tag == "a" and self.in_title:
            self.in_title = False
        elif tag == "a" and self.in_snippet:
            self.in_snippet = False
            if self.current_result and self.current_result.get("title"):
                self.results.append(self.current_result)
                self.current_result = None

    def handle_data(self, data):
        if self.in_title and self.current_result is not None:
            self.current_result["title"] += data.strip()
        elif self.in_snippet and self.current_result is not None:
            self.current_result["snippet"] += data.strip()

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
            model_name="llama-3.1-8b-instant",
            temperature=0.2  # Lower temperature makes the model more deterministic and less likely to hallucinate
        )

    def search_internet(self, query: str) -> List[Dict[str, str]]:
        """
        Performs a web search via DuckDuckGo HTML and parses the results.
        Returns a list of dicts: [{'title': ..., 'link': ..., 'snippet': ...}]
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
            url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                parser = DDGHTMLParser()
                parser.feed(response.text)
                return parser.results[:4]
        except Exception as e:
            print(f"Error performing internet search fallback: {str(e)}")
        return []

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
            
        # Retrieve college context from vector database
        college_context = ""
        is_internet_search = False
        
        # Check if the query specifically asks about an educational institution other than the local one
        is_about_other_college = False
        try:
            is_about_other_college_prompt = (
                "Analyze the following user query. Does it specifically ask about an educational institution "
                "other than Alva's Institute of Engineering and Technology (also known as Alva's College, AIET, or Alva's)? "
                "Respond with exactly one word: 'Yes' or 'No'.\n\n"
                f"Query: {message}"
            )
            is_about_other = self.llm.invoke(is_about_other_college_prompt).content.strip().lower()
            if "yes" in is_about_other:
                is_about_other_college = True
        except Exception as e:
            print(f"Error checking if query is about other college: {str(e)}")

        if not is_about_other_college:
            try:
                from services.qdrant_service import QdrantService
                from services.embedding_service import EmbeddingService
                
                qdrant_service = QdrantService()
                embedding_service = EmbeddingService()
                
                query_vector = embedding_service.embed_query(message)
                search_results = qdrant_service.search_similarity(
                    name=settings.QDRANT_COLLECTION_NAME,
                    query_vector=query_vector,
                    top_k=settings.RAG_TOP_K
                )
                
                # Cosine similarity ranges from -1 to 1; threshold 0.50 filters for relevant college info
                relevant_snippets = [res["text"] for res in search_results if res.get("score", 0.0) >= 0.50]
                if relevant_snippets:
                    college_context = "\n\n---\n\n".join(relevant_snippets)
            except Exception as e:
                # Fall back gracefully if search fails
                print(f"Error performing chatbot RAG search: {str(e)}")

        # Fallback to internet search if:
        # 1. No local documents found (college_context is empty).
        # 2. Query asks about a college/institution.
        if not college_context:
            try:
                # Classify the query using LLM
                class_prompt = (
                    "Analyze the following user query and decide if it is asking for information about a college, university, institute, school, "
                    "or educational institution (e.g., details, ranking, fees, location, courses, etc.). "
                    "Respond with exactly one word: 'Yes' or 'No'.\n\n"
                    f"Query: {message}"
                )
                class_res = self.llm.invoke(class_prompt).content.strip().lower()
                if "yes" in class_res:
                    # Perform internet search
                    search_results = self.search_internet(message)
                    if search_results:
                        is_internet_search = True
                        snippets = []
                        for res in search_results:
                            snippets.append(f"Source: {res['title']} ({res['link']})\nContent: {res['snippet']}")
                        college_context = "\n\n---\n\n".join(snippets)
            except Exception as e:
                print(f"Error performing classification or internet search: {str(e)}")

        # 3. Create the prompt structure
        system_prompt = CHATBOT_SYSTEM_PROMPT
        if college_context:
            if is_internet_search:
                system_prompt += f"\n\nRetrieved Context from Internet Web Search:\n{college_context}\n\nUse the Retrieved Context above to accurately and politely answer the user's question about the college/university. Make sure to ground your answers in the retrieved search results and mention the sources and their URLs (formatted as markdown links, e.g. [Title](URL)) in your response so the user knows where the information came from."
            else:
                system_prompt += f"\n\nRetrieved Context from College Documents:\n{college_context}\n\nUse the Retrieved Context above to accurately and politely answer the user's question about the college. If the context does not contain the answer or is not relevant, rely on general conversational guidelines."

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
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
