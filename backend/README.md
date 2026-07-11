# College FAQ Chatbot - Backend API

This is the backend service for the College FAQ Chatbot project. It is built using Python 3.11 and FastAPI, incorporating JWT authentication, PostgreSQL metadata storage, S3 document storage, and Retrieval-Augmented Generation (RAG) using Groq LLM and Qdrant Cloud.

---

## Technology Stack
* **Framework:** FastAPI (Python 3.11)
* **ORM:** SQLAlchemy (relational database queries)
* **Database:** Neon PostgreSQL (cloud relational database)
* **Vector DB:** Qdrant Cloud
* **Embeddings:** FastEmbed (`BAAI/bge-small-en-v1.5` - 384 dimensions)
* **LLM Engine:** Groq API (using LangChain core and langchain-groq integration)
* **File Storage:** AWS S3 (with local disk fallback option)
* **Server:** Uvicorn

---

## Project Structure
```text
backend/
├── app/
│   └── main.py                     # App entry point (mounting routers and CORS middleware)
├── models/
│   ├── user.py                     # PostgreSQL User Schema
│   ├── document.py                 # PostgreSQL Document Schema (S3 metadata)
│   ├── chat_history.py             # PostgreSQL Chat Logs Schema (conversational memory)
│   └── faq.py                      # PostgreSQL Static FAQs Schema
├── routers/
│   ├── auth.py                     # Endpoints for login, registration, and user profiles
│   ├── chatbot.py                  # Endpoints for conversational chat QA
│   ├── rag.py                      # Endpoints for RAG ingestion and queries
│   ├── documents.py                # Endpoints for document uploading, listing, and deletion
│   └── admin.py                    # Endpoints for administrative CRUD operations on static FAQs
├── schemas/
│   ├── user.py                     # Pydantic user validation schemas
│   ├── document.py                 # Pydantic document validation schemas
│   ├── chatbot.py                  # Pydantic chatbot validation schemas
│   ├── rag.py                      # Pydantic RAG validation schemas
│   └── faq.py                      # Pydantic FAQ validation schemas
├── services/
│   ├── auth_service.py             # Password encryption & JWT token handling
│   ├── s3_service.py               # Direct AWS S3 client integrations (boto3)
│   ├── storage_service.py          # Storage manager abstraction (S3 vs Local toggle)
│   ├── document_service.py         # PDF and DOCX text extraction utilities (pypdf/docx)
│   ├── embedding_service.py        # Vector embedding generator (FastEmbed)
│   ├── qdrant_service.py           # Qdrant client interactions
│   └── ai_service.py               # Groq LLM client interactions and prompt templating
├── utils/
│   ├── file_validator.py           # Validates file types and sizes
│   ├── text_splitter.py            # Chunks long document text
│   └── prompt_templates.py         # System prompt repository
├── config.py                       # Global settings loader using pydantic-settings
├── database.py                     # PostgreSQL connection configurations
├── dependencies.py                 # FastAPI dependency injection helpers
├── .env.example                    # Template file for environment credentials
└── requirements.txt                # Python library dependencies
```

---

## Local Setup Instructions

### 1. Create a Virtual Environment
From the `backend/` directory, run:
```powershell
python -m venv .venv
```

### 2. Activate the Virtual Environment
* **On Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
* **On Linux / macOS:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
* **Note:** If you set `USE_S3_STORAGE=false`, files will be stored locally inside the `backend/static/uploads` folder. S3 credentials are only required if set to `true`.

### 5. Run the Application
Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload
```

Open your browser and navigate to:
* **API Index:** `http://localhost:8000/`
* **Swagger API Documentation:** `http://localhost:8000/docs`
* **Redoc Documentation:** `http://localhost:8000/redoc`
