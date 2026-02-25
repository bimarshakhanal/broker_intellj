from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API
    API_TITLE: str = "Real Estate Dashboard API"
    API_VERSION: str = "0.1.0"
    
    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
