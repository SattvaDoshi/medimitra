# MediMitra Voice Assistant - Real-Time FastAPI Backend

This is the **Real-Time FastAPI backend** for the MediMitra Voice Assistant system that provides health guidance and hospital coordination through **WebSocket connections for real-time voice communication**.

## 🚀 **NEW FEATURES - Real-Time Voice Call Agent**

- **🎙️ Real-Time Voice Calls**: Live bidirectional voice communication using WebSockets
- **🔊 Voice Activity Detection (VAD)**: Automatic detection of speech start/end
- **⚡ Streaming Audio Processing**: Process audio chunks in real-time
- **🗣️ Instant Responses**: Immediate AI responses with streaming audio playback
- **🌐 WebSocket Support**: Real-time bidirectional communication
- **📱 Live Conversation**: Natural conversation flow like a phone call

## Features

### Real-Time Features
- **WebSocket Voice Communication**: Connect via `ws://localhost:8000/ws/voice/{session_id}`
- **Live Audio Streaming**: Send audio chunks and get immediate responses
- **Voice Activity Detection**: Automatically detect when user starts/stops speaking
- **Real-Time Speech Recognition**: Process speech as it's being spoken
- **Streaming Text-to-Speech**: Get audio responses streamed back immediately
- **Session Management**: Maintain conversation context in real-time

### Traditional Features (Still Available)
- **Text-based Chat**: Interact with the AI health assistant using text messages
- **Voice Processing**: Upload audio files for speech-to-text conversion and get audio responses
- **Multi-language Support**: Supports 7 Indian languages (English, Hindi, Gujarati, Marathi, Bengali, Malayalam, Urdu)
- **Hospital Search**: Find hospitals by city with emergency filtering
- **Emergency Detection**: Automatic detection of emergency conditions

## Project Structure

```
python-backend/
├── main.py                      # FastAPI application with WebSocket support
├── config.py                   # Configuration settings
├── routes.py                   # Additional API route definitions
├── requirements.txt            # Python dependencies (with real-time support)
├── test_api.py                # Traditional API tests
├── test_realtime_client.py    # Real-time WebSocket client test
├── .env                       # Environment variables
├── models/
│   ├── __init__.py
│   └── schemas.py             # Pydantic models for API
└── services/
    ├── __init__.py
    ├── voice_assistant.py      # Core voice assistant logic
    ├── realtime_voice.py       # Real-time voice processing service
    └── hospital_data.py        # Hospital database
```

## Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Real-Time Audio Dependencies** (for Windows):
   ```bash
   # For PyAudio (required for real-time audio)
   pip install pipwin
   pipwin install pyaudio
   
   # For WebRTC VAD (Voice Activity Detection)
   pip install webrtcvad
   ```

3. **Set up Environment Variables**:
   - Copy the `.env` file and ensure your `GOOGLE_API_KEY` is set
   - The API key should be the same one used in your model folder

## Running the Server

1. **Start the FastAPI server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the API**:
   - API will be available at: `http://localhost:8000`
   - Interactive API docs: `http://localhost:8000/docs`
   - ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### Core Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check endpoint
- `GET /languages/supported` - Get list of supported languages

### 🎙️ **Real-Time Voice Endpoints (NEW)**

- `WebSocket /ws/voice/{session_id}` - **Real-time voice communication**
- `POST /voice/start-realtime` - Start real-time voice session
- `GET /voice/status/{session_id}` - Get voice session status  
- `DELETE /voice/end/{session_id}` - End real-time voice session

### Traditional Chat Endpoints

- `POST /chat/text` - Send text message to AI assistant
- `POST /chat/voice` - Upload audio file for voice interaction
- `POST /tts/generate` - Generate speech from text
- `POST /stt/transcribe` - Transcribe audio to text

### Hospital Endpoints

- `POST /hospitals/search` - Search hospitals by city
- `GET /hospitals/emergency/{city}` - Get emergency hospitals for city

### Session Management

- `POST /session/start` - Start new conversation session
- `DELETE /session/{session_id}` - End conversation session

## Example Usage

### 🎙️ **Real-Time Voice Communication (NEW)**

#### JavaScript/TypeScript WebSocket Client
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/voice/my_session_123');

// Start voice session
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "start",
        language: "en"
    }));
};

// Handle responses
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "audio_response") {
        // Play greeting audio
        playAudio(data.data.audio);
    } else if (data.type === "conversation_response") {
        console.log("AI Response:", data.data.ai_response);
        playAudio(data.data.audio_response);
    }
};

// Send audio chunk (from microphone)
function sendAudioChunk(audioData) {
    const audioB64 = btoa(String.fromCharCode(...audioData));
    ws.send(JSON.stringify({
        type: "audio",
        data: audioB64
    }));
}

// End session
function endCall() {
    ws.send(JSON.stringify({type: "end"}));
}
```

#### Python Client Example
```python
import asyncio
import websockets
import json

async def voice_chat():
    uri = "ws://localhost:8000/ws/voice/my_session"
    async with websockets.connect(uri) as websocket:
        # Start session
        await websocket.send(json.dumps({
            "type": "start",
            "language": "en"
        }))
        
        # Listen for responses
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data['type']}")
            
            if data['type'] == 'conversation_response':
                print(f"AI: {data['data']['ai_response']}")

asyncio.run(voice_chat())
```

### Traditional API Examples

### Text Chat
```python
import requests

response = requests.post("http://localhost:8000/chat/text", json={
    "message": "I have a severe headache and fever",
    "language": "en"
})
print(response.json())
```

### Hospital Search
```python
response = requests.post("http://localhost:8000/hospitals/search", json={
    "city": "mumbai",
    "emergency_required": True,
    "max_results": 3
})
print(response.json())
```

### Voice Chat
```python
import requests

with open("audio.wav", "rb") as audio_file:
    response = requests.post(
        "http://localhost:8000/chat/voice",
        files={"audio": audio_file},
        data={"language": "en"}
    )
print(response.json())
```

## Testing

### Test Real-Time Voice System
```bash
python test_realtime_client.py
```

### Test Traditional API
```bash
python test_api.py
```

Or using pytest:
```bash
pytest test_api.py -v
```

### Manual WebSocket Testing
You can also test WebSockets using tools like:
- **wscat**: `wscat -c ws://localhost:8000/ws/voice/test123`
- **Browser Console**: Use JavaScript WebSocket API
- **Postman**: WebSocket feature

## Configuration

The application can be configured through environment variables in the `.env` file:

- `GOOGLE_API_KEY`: Google Generative AI API key
- `DEBUG`: Enable debug mode (True/False)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## Supported Languages

| Language | Code | Speech Recognition | Text-to-Speech |
|----------|------|-------------------|----------------|
| English | en | en-IN | en |
| Hindi | hi | hi-IN | hi |
| Gujarati | gu | gu-IN | gu |
| Marathi | mr | mr-IN | mr |
| Bengali | bn | bn-IN | bn |
| Malayalam | ml | ml-IN | ml |
| Urdu | ur | ur-IN | ur |

## Error Handling

The API includes comprehensive error handling:
- **400**: Bad Request (invalid file format, missing parameters)
- **500**: Internal Server Error (AI service errors, speech processing errors)

All errors return a JSON response with error details.

## Production Deployment

For production deployment:

1. **Set environment variables appropriately**:
   - Set `DEBUG=False`
   - Configure specific `ALLOWED_ORIGINS`
   - Use a production ASGI server

2. **Use a production ASGI server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

3. **Consider using a reverse proxy** (nginx) for static file serving and load balancing.

## 🎯 **Real-Time Voice Call Features**

### 📞 **Like a Phone Call**
- **Continuous conversation**: Just like talking on a phone
- **Interruption handling**: Can interrupt AI while it's speaking
- **Natural flow**: No need to wait for complete responses
- **Low latency**: Near real-time response (< 2 seconds)

### 🧠 **Smart Audio Processing**
- **Voice Activity Detection**: Knows when you start/stop speaking
- **Noise filtering**: Filters out background noise
- **Chunk processing**: Processes audio in small chunks for responsiveness
- **Dynamic adjustment**: Adapts to different speaking speeds

### 🌐 **WebSocket Communication**
- **Bidirectional**: Send and receive audio simultaneously
- **Event-driven**: Real-time status updates
- **Session management**: Maintains conversation context
- **Error handling**: Graceful error recovery

### 📱 **Frontend Integration Ready**
- **React/React Native**: Easy to integrate with your existing frontends
- **Audio streaming**: Ready for microphone input and speaker output
- **State management**: Real-time session status tracking
- **Mobile optimized**: Works on mobile devices

## Integration

This FastAPI backend is designed to work with:
- The React frontend in the `frontend/` folder
- The React Native mobile app in the `medimitra/` folder  
- The Node.js backend in the `backend/` folder

The real-time voice API provides a **phone call-like experience** that can be integrated into web and mobile applications! 🎉

## Real-Time vs Traditional

| Feature | Traditional API | Real-Time Voice API |
|---------|----------------|-------------------|
| Response Time | 3-5 seconds | < 2 seconds |
| Conversation Flow | Upload → Wait → Response | Continuous streaming |
| Interruption | Not possible | Yes, like phone calls |
| Audio Quality | File-based | Streaming chunks |
| User Experience | Form-like | Phone call-like |
| Mobile Friendly | Limited | Optimized |