# Why this file is written:
# This is the main entry point of the FastAPI backend application.
# It initializes the FastAPI app instance, configures cross-origin resource sharing (CORS),
# defines base configurations (like title and docs url), and sets up the initial root endpoint.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import routers and database to trigger table creation
from database import Base, engine
from routers import auth, chatbot, rag, documents, admin

Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="College FAQ Chatbot API",
    description="Backend API for the College FAQ Chatbot capstone project, supporting authentication, document management, and RAG-based QA.",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing) middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(chatbot.router)
app.include_router(rag.router)
app.include_router(documents.router)
app.include_router(admin.router)

# Ensure local static directory exists and mount it for local storage uploads
if not os.path.exists("static"):
    os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    """
    Root endpoint to verify that the API is running successfully.
    """
    return {
        "message": "Welcome to the College FAQ Chatbot API!",
        "status": "online"
    }
