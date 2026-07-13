# Why this file is written:
# This Dockerfile containerizes the FastAPI backend.
# It uses a slim Python 3.11 base image, installs build dependencies,
# installs pip requirements, exposes port 8000, and launches uvicorn.

FROM python:3.11-slim

# Set environment system variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (gcc is needed for building certain python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create cache directory and pre-download FastEmbed model during docker build to prevent runtime OOM
ENV FASTEMBED_CACHE_PATH=/app/fastembed_cache
RUN mkdir -p /app/fastembed_cache && \
    python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='BAAI/bge-small-en-v1.5')"

# Copy backend source files
COPY . .

# Expose port 8000
EXPOSE 8000

# Start Uvicorn Dev/Prod server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
