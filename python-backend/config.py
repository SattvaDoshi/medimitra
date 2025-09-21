"""
Configuration settings for the FastAPI application
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Google API
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # FastAPI settings
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS settings
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # File upload settings
    MAX_FILE_SIZE: str = os.getenv("MAX_FILE_SIZE", "50MB")
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "./uploads")
    
    # AI Model settings
    AI_MODEL: str = "gemini-1.5-flash"
    
    # Supported languages
    SUPPORTED_LANGUAGES = {
        'en': {'stt': 'en-IN', 'tts': 'en', 'name': 'English'},
        'hi': {'stt': 'hi-IN', 'tts': 'hi', 'name': 'Hindi'},
        'gu': {'stt': 'gu-IN', 'tts': 'gu', 'name': 'Gujarati'},
        'mr': {'stt': 'mr-IN', 'tts': 'mr', 'name': 'Marathi'},
        'bn': {'stt': 'bn-IN', 'tts': 'bn', 'name': 'Bengali'},
        'ml': {'stt': 'ml-IN', 'tts': 'ml', 'name': 'Malayalam'},
        'ur': {'stt': 'ur-IN', 'tts': 'ur', 'name': 'Urdu'}
    }

settings = Settings()