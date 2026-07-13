# Why this file is written:
# This file loads and validates the application configuration parameters.
# It reads settings from environment variables (or a local .env file)
# using Pydantic Settings V2, ensuring all API keys (Groq, Qdrant) and configs
# are loaded securely with fallback defaults.

# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings class using Pydantic Settings to bind env variables.
    """
    
    # ----------------------------------------------------
    # Security & JWT Configuration
    # ----------------------------------------------------
    SECRET_KEY: str = Field("my_secret_key", description="Secret key for signing JWT tokens")
    ALGORITHM: str = Field("HS256", description="Encryption algorithm used for JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, description="Lifetime of an access token in minutes")

    # ----------------------------------------------------
    # Database Configuration (Neon PostgreSQL)
    # ----------------------------------------------------
    # Neon URLs usually start with postgresql:// or postgres://. 
    # SQLAlchemy requires postgresql:// (with 'ql'), so we handle database connections accordingly.
    DATABASE_URL: str = Field("postgresql://user:password@localhost:5432/college_db", description="PostgreSQL DB connection string")

    # ----------------------------------------------------
    # Vector Database Configuration (Qdrant Cloud)
    # ----------------------------------------------------
    QDRANT_URL: str = Field("http://localhost:6333", description="Qdrant API Endpoint URL")
    QDRANT_API_KEY: Optional[str] = Field(None, description="Secure API Key for Qdrant Cloud (optional for local running)")
    QDRANT_COLLECTION_NAME: str = Field("college_faq_collection", description="Target collection name inside Qdrant")

    # ----------------------------------------------------
    # AI / LLM Configuration (Groq Cloud API)
    # ----------------------------------------------------
    GROQ_API_KEY: str = Field("gsk_mock_api_key_replace_me", description="API Key to access Groq LLM inference service")
    RAG_TOP_K: int = Field(8, description="Number of source document chunks to inject as context")

    # ----------------------------------------------------
    # Storage Configuration (AWS S3 vs Local Disk)
    # ----------------------------------------------------
    USE_S3_STORAGE: bool = Field(False, description="Set to True to upload files to AWS S3, False to save on local disk")
    LOCAL_UPLOAD_DIR: str = Field("static/uploads", description="Directory path to write uploaded files locally")
    
    # S3 Credentials
    AWS_ACCESS_KEY_ID: Optional[str] = Field(None, description="AWS IAM User Access Key ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(None, description="AWS IAM User Secret Access Key")
    AWS_REGION: str = Field("us-east-1", description="Target AWS region containing the S3 bucket")
    AWS_BUCKET_NAME: Optional[str] = Field(None, description="S3 bucket name where files are saved")

    # Configure Pydantic to read from a local '.env' file first
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignores extra variables present in env
    )

# Instantiate the global settings object to import across services
settings = Settings()
