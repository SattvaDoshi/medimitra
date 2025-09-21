"""
Simplified Main Application - Handles Missing Dependencies Gracefully
"""

import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_import_dependencies():
    """Check and import required dependencies"""
    missing_deps = []
    
    try:
        global FastAPI, HTTPException, WebSocket, WebSocketDisconnect
        global CORSMiddleware, FileResponse, UploadFile, File, Form
        global uvicorn, json, asyncio
        
        from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import FileResponse
        import uvicorn
        import json
        import asyncio
        
        logger.info("✅ Core FastAPI dependencies loaded")
        
    except ImportError as e:
        logger.error(f"❌ Core dependencies missing: {e}")
        missing_deps.append("fastapi, uvicorn")
    
    try:
        global load_dotenv
        from dotenv import load_dotenv
        load_dotenv()
        logger.info("✅ Environment variables loaded")
    except ImportError:
        logger.warning("⚠️ python-dotenv not available, skipping .env file")
        def load_dotenv(): pass
    
    try:
        global genai
        import google.generativeai as genai
        logger.info("✅ Google Generative AI loaded")
    except ImportError as e:
        logger.error(f"❌ Google Generative AI missing: {e}")
        missing_deps.append("google-generativeai")
    
    if missing_deps:
        logger.error(f"❌ Missing critical dependencies: {', '.join(missing_deps)}")
        logger.error("🔧 Please install: pip install fastapi uvicorn google-generativeai python-dotenv")
        sys.exit(1)
    
    return True

def create_app():
    """Create FastAPI application"""
    
    # Check dependencies first
    if not check_and_import_dependencies():
        return None
    
    # Initialize FastAPI app
    app = FastAPI(
        title="MediMitra Real-Time Voice Assistant API",
        description="AI-powered real-time voice assistant for health guidance",
        version="2.0.0"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Configure Google AI
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.error("❌ GOOGLE_API_KEY not found in environment variables")
            logger.error("🔧 Please set GOOGLE_API_KEY in your .env file")
            return None
        
        genai.configure(api_key=api_key)
        logger.info("✅ Google AI configured")
    except Exception as e:
        logger.error(f"❌ Failed to configure Google AI: {e}")
        return None
    
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "MediMitra Real-Time Voice Assistant API is running", 
            "version": "2.0.0",
            "status": "healthy"
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "service": "real-time-voice-assistant-api"}
    
    @app.get("/features")
    async def get_features():
        """Get available features based on installed dependencies"""
        features = {
            "core_api": True,
            "text_chat": True,
            "basic_voice": False,
            "realtime_voice": False,
            "voice_activity_detection": False,
            "hospital_search": True
        }
        
        # Check optional dependencies
        try:
            import speech_recognition
            features["basic_voice"] = True
            logger.info("✅ Speech recognition available")
        except ImportError:
            logger.warning("⚠️ Speech recognition not available")
        
        try:
            import websockets
            features["realtime_voice"] = True
            logger.info("✅ Real-time voice available")
        except ImportError:
            logger.warning("⚠️ WebSockets not available")
        
        try:
            import webrtcvad
            features["voice_activity_detection"] = True
            logger.info("✅ Advanced voice activity detection available")
        except ImportError:
            logger.warning("⚠️ WebRTC VAD not available")
        
        return {"features": features}
    
    @app.post("/chat/simple")
    async def simple_chat(message: str, language: str = "en"):
        """Simple text chat without advanced features"""
        try:
            # Create a simple AI model
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Simple health-focused prompt
            prompt = f"""
            You are a helpful health assistant. The user said: "{message}"
            
            Please provide helpful health guidance in {language}.
            Keep your response concise and helpful.
            Always remind users to consult healthcare professionals for serious concerns.
            """
            
            response = model.generate_content(prompt)
            
            return {
                "response": response.text,
                "language": language,
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            logger.error(f"Error in simple chat: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/languages")
    async def get_supported_languages():
        """Get list of supported languages"""
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
    
    # Try to load advanced features
    try:
        from services.voice_assistant import VoiceAssistantService
        voice_service = VoiceAssistantService()
        
        @app.post("/chat/advanced")
        async def advanced_chat(message: str, language: str = "en", session_id: str = None):
            """Advanced chat with full features"""
            try:
                response = await voice_service.process_text_message(
                    message=message,
                    language=language,
                    session_id=session_id
                )
                return response
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        logger.info("✅ Advanced chat features loaded")
        
    except ImportError as e:
        logger.warning(f"⚠️ Advanced features not available: {e}")
    
    # Try to load real-time features
    try:
        import websockets
        from services.realtime_voice import RealTimeVoiceAgent
        
        realtime_agent = RealTimeVoiceAgent()
        
        @app.websocket("/ws/voice/{session_id}")
        async def websocket_voice_endpoint(websocket: WebSocket, session_id: str):
            """Real-time voice communication WebSocket endpoint"""
            await websocket.accept()
            
            try:
                await websocket.send_text(json.dumps({
                    "type": "connected", 
                    "message": "Real-time voice session started",
                    "session_id": session_id
                }))
                
                while True:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    # Echo back for now (implement full logic when all deps are available)
                    await websocket.send_text(json.dumps({
                        "type": "echo",
                        "data": message
                    }))
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected: {session_id}")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
        
        logger.info("✅ Real-time voice features loaded")
        
    except ImportError as e:
        logger.warning(f"⚠️ Real-time voice features not available: {e}")
    
    return app

def main():
    """Main function to run the application"""
    
    print("🎙️ MediMitra Voice Assistant API")
    print("=" * 40)
    
    # Create the app
    app = create_app()
    if not app:
        print("❌ Failed to create application")
        return
    
    print("✅ Application created successfully")
    print("🚀 Starting server...")
    print("📱 API will be available at: http://localhost:8000")
    print("📖 Interactive docs at: http://localhost:8000/docs")
    print("🔍 Features available at: http://localhost:8000/features")
    
    # Start the server
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")

if __name__ == "__main__":
    main()