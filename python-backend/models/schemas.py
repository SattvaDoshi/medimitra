"""
Pydantic models for API request/response schemas
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    language: str
    session_id: str
    timestamp: datetime
    requires_hospital: bool = False
    emergency_level: str = "none"  # none, low, moderate, high, emergency
    audio_url: Optional[str] = None

class HospitalInfo(BaseModel):
    name: str
    address: str
    phone: str
    emergency_phone: Optional[str] = None
    specialties: List[str] = []
    emergency_services: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance: Optional[float] = None

class HospitalSearchRequest(BaseModel):
    city: str
    emergency_required: bool = False
    max_results: int = 3

class HospitalSearchResponse(BaseModel):
    hospitals: List[HospitalInfo]
    city: str
    total_found: int
    error_message: Optional[str] = None

class LanguageSelection(BaseModel):
    language: str

class VoiceProcessRequest(BaseModel):
    audio_data: bytes
    language: str = "en"
    session_id: Optional[str] = None

class TranscriptionResponse(BaseModel):
    text: str
    confidence: float
    language: str

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    speed: float = 1.0
    voice: Optional[str] = None

class SessionInfo(BaseModel):
    session_id: str
    language: str
    created_at: datetime
    last_activity: datetime
    message_count: int

class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: datetime
    
class HealthStatus(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, bool]