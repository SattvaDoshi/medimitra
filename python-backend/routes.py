"""
API Routes for different endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import tempfile
import os

from services.voice_assistant import VoiceAssistantService
from models.schemas import (
    ChatRequest, 
    ChatResponse, 
    HospitalSearchRequest, 
    HospitalSearchResponse
)

# Initialize router
router = APIRouter()

# Initialize voice assistant service
voice_service = VoiceAssistantService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat with the AI assistant using text input"""
    try:
        response = await voice_service.process_text_message(
            message=request.message,
            language=request.language,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice-chat")
async def voice_chat_endpoint(
    audio: UploadFile = File(...),
    language: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """Process voice input and return response"""
    try:
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be audio format")
        
        # Save uploaded audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        response = await voice_service.process_voice_message(
            audio_path=temp_file_path,
            language=language,
            session_id=session_id
        )
        
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hospitals", response_model=HospitalSearchResponse)
async def search_hospitals_endpoint(request: HospitalSearchRequest):
    """Search for hospitals in a specific city"""
    try:
        response = await voice_service.search_hospitals(
            city=request.city,
            emergency_required=request.emergency_required,
            max_results=request.max_results
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))