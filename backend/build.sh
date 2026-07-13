#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Pre-download the FastEmbed model weights so they are cached inside the build environment.
# This prevents downloading them during startup, avoiding OOM (Out Of Memory) issues on the free tier.
echo "Pre-downloading FastEmbed model weights..."
export FASTEMBED_CACHE_PATH=$(pwd)/fastembed_cache
python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='BAAI/bge-small-en-v1.5')"
echo "FastEmbed model weights pre-downloaded successfully!"
