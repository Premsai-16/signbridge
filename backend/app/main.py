from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.datasets import router as datasets_router

app = FastAPI(
    title="SignBridge AI API",
    description="AI-powered accessibility and sign language platform",
    version="0.2.0",
)

# Development-only frontend access.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


app.include_router(
    datasets_router,
    prefix="/api/v1",
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to SignBridge AI",
        "status": "running",
    }


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SignBridge AI Backend",
        "version": "0.2.0",
    }