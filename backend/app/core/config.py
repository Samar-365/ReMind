import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma2:2b")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./handoffs.db")
    SCHEDULED_TIME: str = os.getenv("SCHEDULED_TIME", "18:00")
    AUTO_GENERATE_SCHEDULE: bool = os.getenv("AUTO_GENERATE_SCHEDULE", "false").lower() in ("true", "1", "t")

settings = Settings()
