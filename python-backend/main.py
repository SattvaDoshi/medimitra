"""
FastAPI Backend for Voice Assistant Health System
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import uvicorn
from typing import Optional, List
import os
import json
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import custom modules
from services.voice_assistant import VoiceAssistantService
from services.realtime_voice import RealTimeVoiceAgent
from models.schemas import (
    ChatRequest, 
    ChatResponse, 
    HospitalSearchRequest, 
    HospitalSearchResponse,
    LanguageSelection,
    VoiceProcessRequest
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MediMitra Real-Time Voice Assistant API",
    description="AI-powered real-time voice assistant for health guidance and hospital coordination",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
voice_service = VoiceAssistantService()
realtime_agent = RealTimeVoiceAgent()

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected: {session_id}")

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(json.dumps(message))

manager = ConnectionManager()

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "MediMitra Real-Time Voice Assistant API is running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "real-time-voice-assistant-api"}

# ===== REAL-TIME VOICE WEBSOCKET ENDPOINTS =====

@app.websocket("/ws/voice/{session_id}")
async def websocket_voice_endpoint(websocket: WebSocket, session_id: str):
    """
    Real-time voice communication WebSocket endpoint
    
    Message formats:
    - Start session: {"type": "start", "language": "en"}
    - Audio chunk: {"type": "audio", "data": "base64_audio_data"}
    - End session: {"type": "end"}
    """
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "start":
                # Start voice session
                language = message.get("language", "en")
                result = await realtime_agent.start_voice_session(session_id, language)
                
                await manager.send_message(session_id, {
                    "type": "session_started",
                    "data": result
                })
                
                # Send greeting audio
                if result.get("greeting"):
                    greeting_audio = await voice_service.text_to_speech(
                        result["greeting"], 
                        language
                    )
                    
                    # Convert to base64 and send
                    import base64
                    with open(greeting_audio, 'rb') as f:
                        audio_b64 = base64.b64encode(f.read()).decode()
                    
                    await manager.send_message(session_id, {
                        "type": "audio_response",
                        "data": {
                            "audio": audio_b64,
                            "text": result["greeting"],
                            "language": language
                        }
                    })
            
            elif message_type == "audio":
                # Process audio chunk
                import base64
                audio_data = base64.b64decode(message.get("data", ""))
                
                result = await realtime_agent.process_audio_chunk(session_id, audio_data)
                
                # Send real-time status
                await manager.send_message(session_id, {
                    "type": "audio_processed",
                    "data": result
                })
                
                # If we got a complete response, send it
                if "ai_response" in result:
                    await manager.send_message(session_id, {
                        "type": "conversation_response",
                        "data": {
                            "transcription": result.get("transcription", ""),
                            "ai_response": result.get("ai_response", ""),
                            "audio_response": result.get("audio_response", ""),
                            "emergency_level": result.get("emergency_level", "none"),
                            "requires_hospital": result.get("requires_hospital", False)
                        }
                    })
            
            elif message_type == "end":
                # End voice session
                result = await realtime_agent.end_voice_session(session_id)
                await manager.send_message(session_id, {
                    "type": "session_ended",
                    "data": result
                })
                break
            
            elif message_type == "status":
                # Get session status
                status = await realtime_agent.get_session_status(session_id)
                await manager.send_message(session_id, {
                    "type": "status_update",
                    "data": status
                })
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        await realtime_agent.end_voice_session(session_id)
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.send_message(session_id, {
            "type": "error",
            "data": {"error": str(e)}
        })

# ===== TRADITIONAL REST API ENDPOINTS (for backward compatibility) =====

# ===== TRADITIONAL REST API ENDPOINTS (for backward compatibility) =====

@app.post("/chat/text", response_model=ChatResponse)
async def chat_with_text(request: ChatRequest):
    """
    Chat with the AI assistant using text input
    """
    try:
        response = await voice_service.process_text_message(
            message=request.message,
            language=request.language,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/voice")
async def chat_with_voice(
    audio: UploadFile = File(...),
    language: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """
    Process voice input and return both text and audio response (non-real-time)
    """
    try:
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be audio format")
        
        # Save uploaded audio temporarily
        audio_path = f"temp_audio_{session_id or 'default'}.wav"
        with open(audio_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        response = await voice_service.process_voice_message(
            audio_path=audio_path,
            language=language,
            session_id=session_id
        )
        
        # Clean up temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/hospitals/search", response_model=HospitalSearchResponse)
async def search_hospitals(request: HospitalSearchRequest):
    """
    Search for hospitals in a specific city
    """
    try:
        response = await voice_service.search_hospitals(
            city=request.city,
            emergency_required=request.emergency_required,
            max_results=request.max_results
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hospitals/emergency/{city}")
async def get_emergency_hospitals(city: str):
    """
    Get emergency hospitals for a specific city
    """
    try:
        response = await voice_service.search_hospitals(
            city=city,
            emergency_required=True,
            max_results=3
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts/generate")
async def generate_speech(text: str, language: str):
    """
    Generate speech from text
    """
    try:
        audio_path = await voice_service.text_to_speech(text, language)
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename="response.mp3",
            background=True  # Delete file after sending
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stt/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form(...)
):
    """
    Transcribe audio to text
    """
    try:
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be audio format")
        
        # Save uploaded audio temporarily
        audio_path = f"temp_transcribe_{hash(audio.filename)}.wav"
        with open(audio_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        transcription = await voice_service.speech_to_text(audio_path, language)
        
        # Clean up temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/languages/supported")
async def get_supported_languages():
    """
    Get list of supported languages
    """
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
            {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
            {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
            {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"},
            {"code": "ur", "name": "Urdu", "native_name": "اردو"}
        ]
    }

@app.post("/session/start")
async def start_session(language_selection: LanguageSelection):
    """
    Start a new conversation session
    """
    try:
        session_id = await voice_service.start_session(language_selection.language)
        return {
            "session_id": session_id,
            "language": language_selection.language,
            "greeting": await voice_service.get_greeting(language_selection.language)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
async def end_session(session_id: str):
    """
    End a conversation session
    """
    try:
        await voice_service.end_session(session_id)
        return {"message": "Session ended successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== REAL-TIME VOICE ENDPOINTS =====

@app.post("/voice/start-realtime")
async def start_realtime_voice(language_selection: LanguageSelection, session_id: str):
    """
    Start a real-time voice session
    """
    try:
        result = await realtime_agent.start_voice_session(session_id, language_selection.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voice/status/{session_id}")
async def get_voice_session_status(session_id: str):
    """
    Get real-time voice session status
    """
    try:
        status = await realtime_agent.get_session_status(session_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/voice/end/{session_id}")
async def end_realtime_voice(session_id: str):
    """
    End a real-time voice session
    """
    try:
        result = await realtime_agent.end_voice_session(session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== CLEANUP TASK =====

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks"""
    # Start cleanup task for inactive sessions
    asyncio.create_task(cleanup_inactive_sessions())

async def cleanup_inactive_sessions():
    """Background task to cleanup inactive sessions"""
    while True:
        try:
            realtime_agent.cleanup_inactive_sessions()
            await asyncio.sleep(60)  # Run every minute
        except Exception as e:
            logger.error(f"Cleanup task error: {e}")
            await asyncio.sleep(60)

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )