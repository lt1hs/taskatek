from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize connections, load models, etc.
    print("🚀 Taskatek API Server Starting...")
    yield
    # Shutdown: Clean up resources
    print("👋 Taskatek API Server Shutting Down...")

app = FastAPI(
    title="Taskatek API",
    description="Arabic-first, AI-powered project management platform API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "تاسكاتك API | Taskatek API",
        "version": "0.1.0",
        "status": "running",
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "database": "operational",
            "ai_brain": "operational",
        },
    }

# Import and include routers
from api import auth, workspaces, tasks, brain, automations

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(workspaces.router, prefix="/api/workspaces", tags=["Workspaces"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(brain.router, prefix="/api/brain", tags=["AI Brain"])
app.include_router(automations.router, prefix="/api/automations", tags=["Automations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
