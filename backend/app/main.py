import os
# Limit multi-threading for ONNX Runtime and numeric libraries.
# This must be done at the very top before importing other packages,
# to prevent exceeding the memory limit (512MB RAM) on Render/containers.
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
