# Why this file is written:
# This service is responsible for generating vector embeddings for text snippets.
# It uses the FastEmbed library with the 'BAAI/bge-small-en-v1.5' model (384 dimensions).
# Converting raw text into vectors allows us to store them in Qdrant and perform semantic
# searches to find the best matching answers to student questions.

import os
# Limit multi-threading for ONNX Runtime and numeric libraries to minimize memory usage on resource-constrained hosting (e.g. Render 512MB RAM free tier).
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["FASTEMBED_CACHE_PATH"] = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "fastembed_cache")
)

# Monkey-patch ONNX Runtime to disable the CPU memory arena and memory patterns.
# This significantly reduces the memory footprint of FastEmbed/ONNX Runtime on Render (512MB limit).
try:
    import onnxruntime as ort
    original_init = ort.InferenceSession.__init__
    def patched_init(self, model_path, sess_options=None, *args, **kwargs):
        if sess_options is None:
            sess_options = ort.SessionOptions()
        sess_options.enable_cpu_mem_arena = False
        sess_options.enable_mem_pattern = False
        original_init(self, model_path, sess_options, *args, **kwargs)
    ort.InferenceSession.__init__ = patched_init
except ImportError:
    pass

from typing import List
from fastembed import TextEmbedding

class EmbeddingService:
    """
    Service encapsulating the FastEmbed model to generate 384-dimensional text embeddings.
    """

    def __init__(self):
        """
        Initialize the FastEmbed model. 
        Downloads the 'BAAI/bge-small-en-v1.5' model weights if not already present.
        """
        # The BAAI/bge-small-en-v1.5 model generates compact, 384-dimensional vector embeddings
        # which are highly optimized for fast, accurate retrieval tasks.
        # We explicitly set threads=1 to limit intra-op parallelism and minimize memory footprint.
        self.model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5", threads=1)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generates numerical vector embeddings for a list of string texts.
        
        Inputs:
            texts (List[str]): List of paragraph chunks or sentences to convert.
            
        Outputs:
            List[List[float]]: A list of 384-dimensional floating point vectors.
            
        Flow:
            1. Passes the list of texts to FastEmbed model.embed().
            2. The model returns a generator yielding numpy arrays.
            3. Converts the generated vectors into standard Python lists and returns them.
        """
        if not texts:
            return []
            
        # self.model.embed() returns a generator yielding embedding vectors.
        # We convert each numpy array vector to a standard Python list[float]
        embeddings_generator = self.model.embed(texts)
        return [list(vector) for vector in embeddings_generator]

    def embed_query(self, query: str) -> List[float]:
        """
        Generates a single vector embedding for a search query.
        
        Inputs:
            query (str): The search input string (e.g. "What is the fee?").
            
        Outputs:
            List[float]: A single 384-dimensional vector.
        """
        embeddings = self.embed_texts([query])
        return embeddings[0] if embeddings else []
