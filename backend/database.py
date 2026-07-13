# Why this file is written:
# This file sets up the SQLAlchemy database engine, session local factory, 
# and the declarative Base class. It connects the backend to PostgreSQL (Neon).
# It also safely handles cloud SSL connection requirements and Neon postgres:// URL rewrites.

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Import configured database url
from config import settings

db_url = settings.DATABASE_URL

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Supabase pooler strings sometimes contain '&supa=base-pooler.x'.
# psycopg2/libpq does not recognize 'supa' as a valid connection parameter and throws an error.
# We strip it out to prevent psycopg2 from failing.
if "supa=" in db_url:
    from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
    parsed = urlparse(db_url)
    query = dict(parse_qsl(parsed.query))
    query.pop("supa", None)
    db_url = urlunparse(parsed._replace(query=urlencode(query)))

# Standard connection configurations.
connect_args = {}

# Neon Cloud requires SSL connections in production.
# We append 'sslmode=require' if we detect we are connecting to a cloud (non-localhost) address using PostgreSQL.
if db_url.startswith("postgresql") and "localhost" not in db_url and "127.0.0.1" not in db_url:
    connect_args = {"sslmode": "require"}

# Initialize the SQLAlchemy engine
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True  # Enables database connection health checks before queries
)

# SessionLocal instances represent database transactions
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Base class which all models (User, FAQ, Document, ChatHistory) inherit from to register table structures
Base = declarative_base()
