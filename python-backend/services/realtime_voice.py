"""
Real-time Voice Call Agent Service
Handles real-time audio streaming, voice activity detection, and continuous conversation
"""

import asyncio
import json
import logging
import time
import wave
import io
import base64
from typing import Optional, Dict, Any, AsyncGenerator
import speech_recognition as sr
from gtts import gTTS
import google.generativeai as genai
import numpy as np
try:
    import webrtcvad
    WEBRTC_AVAILABLE = True
except ImportError:
    WEBRTC_AVAILABLE = False
    print("Warning: webrtcvad not available. Using simple energy-based VAD.")

try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
except ImportError:
    PYAUDIO_AVAILABLE = False
    print("Warning: pyaudio not available. Voice recording features limited.")

from .voice_assistant import VoiceAssistantService
from .hospital_data import EMERGENCY_CONDITIONS

logger = logging.getLogger(__name__)

class RealTimeVoiceAgent:
    def __init__(self):
        """Initialize the real-time voice agent"""
        self.voice_service = VoiceAssistantService()
        
        # Audio configuration
        self.sample_rate = 16000  # 16kHz for speech recognition
        self.frame_duration = 30  # 30ms frames for VAD
        self.frame_size = int(self.sample_rate * self.frame_duration / 1000)
        
        # Voice Activity Detection
        if WEBRTC_AVAILABLE:
            self.vad = webrtcvad.Vad(2)  # Aggressiveness level 0-3
        else:
            self.vad = None
        
        # Speech recognition setup
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.recognizer.phrase_threshold = 0.3
        
        # Real-time processing state
        self.active_sessions: Dict[str, Dict] = {}
        
    async def start_voice_session(self, session_id: str, language: str = "en") -> Dict:
        """Start a new real-time voice session"""
        
        # Initialize session with voice assistant
        await self.voice_service.start_session(language)
        
        self.active_sessions[session_id] = {
            'language': language,
            'audio_buffer': bytearray(),
            'is_speaking': False,
            'last_activity': time.time(),
            'conversation_active': True,
            'silence_start': None,
            'speech_frames': [],
            'processing_audio': False
        }
        
        return {
            'session_id': session_id,
            'status': 'active',
            'language': language,
            'greeting': await self.voice_service.get_greeting(language)
        }
    
    async def process_audio_chunk(self, session_id: str, audio_data: bytes) -> Dict[str, Any]:
        """Process incoming audio chunk in real-time"""
        
        if session_id not in self.active_sessions:
            return {'error': 'Session not found'}
        
        session = self.active_sessions[session_id]
        session['last_activity'] = time.time()
        
        # Add audio to buffer
        session['audio_buffer'].extend(audio_data)
        
        # Convert to numpy array for processing
        try:
            audio_np = np.frombuffer(audio_data, dtype=np.int16)
            
            # Voice Activity Detection
            voice_detected = self._detect_voice_activity(audio_np, session)
            
            response = {
                'voice_detected': voice_detected,
                'is_processing': session['processing_audio'],
                'timestamp': time.time()
            }
            
            # If voice activity detected and we have enough audio, process it
            if voice_detected and not session['processing_audio']:
                session['speech_frames'].append(audio_data)
                
                # Check if we should process the accumulated speech
                if self._should_process_speech(session):
                    session['processing_audio'] = True
                    
                    # Process the accumulated speech
                    speech_result = await self._process_accumulated_speech(session_id)
                    if speech_result:
                        response.update(speech_result)
                    
                    session['processing_audio'] = False
                    session['speech_frames'] = []
            
            elif not voice_detected and session['speech_frames']:
                # End of speech detected, process if we have content
                if len(session['speech_frames']) > 5:  # Minimum frames threshold
                    session['processing_audio'] = True
                    
                    speech_result = await self._process_accumulated_speech(session_id)
                    if speech_result:
                        response.update(speech_result)
                    
                    session['processing_audio'] = False
                
                session['speech_frames'] = []
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")
            return {'error': str(e)}
    
    def _detect_voice_activity(self, audio_data: np.ndarray, session: Dict) -> bool:
        """Detect voice activity in audio chunk"""
        
        # Simple energy-based VAD (fallback method)
        try:
            # Convert to float32 for processing
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)
            
            # Calculate RMS energy
            energy = np.sqrt(np.mean(audio_data ** 2))
            
            # Dynamic threshold adjustment
            if not hasattr(self, '_energy_history'):
                self._energy_history = []
            
            self._energy_history.append(energy)
            if len(self._energy_history) > 50:  # Keep last 50 frames
                self._energy_history.pop(0)
            
            # Calculate adaptive threshold
            if len(self._energy_history) > 10:
                avg_energy = np.mean(self._energy_history)
                threshold = avg_energy * 2.5  # 2.5x average as threshold
            else:
                threshold = 0.01  # Default threshold
            
            is_speech = energy > threshold
            
            # Apply smoothing to reduce false positives
            if not hasattr(self, '_speech_history'):
                self._speech_history = []
            
            self._speech_history.append(is_speech)
            if len(self._speech_history) > 5:
                self._speech_history.pop(0)
            
            # Speech detected if majority of recent frames are speech
            speech_confidence = sum(self._speech_history) / len(self._speech_history)
            final_is_speech = speech_confidence > 0.6
            
        except Exception as e:
            logger.warning(f"Energy-based VAD error: {e}")
            final_is_speech = False
        
        # If WebRTC VAD is available, use it as primary method
        if WEBRTC_AVAILABLE and self.vad:
            try:
                # Convert to int16 for WebRTC VAD
                if audio_data.dtype != np.int16:
                    # Normalize and convert to int16
                    normalized = np.clip(audio_data * 32767, -32768, 32767)
                    audio_int16 = normalized.astype(np.int16)
                else:
                    audio_int16 = audio_data
                
                audio_bytes = audio_int16.tobytes()
                
                # WebRTC VAD requires specific frame sizes (10ms, 20ms, or 30ms)
                frame_size_bytes = self.frame_size * 2  # 2 bytes per sample for int16
                
                if len(audio_bytes) >= frame_size_bytes:
                    frame = audio_bytes[:frame_size_bytes]
                    webrtc_result = self.vad.is_speech(frame, self.sample_rate)
                    
                    # Combine WebRTC result with energy-based result
                    final_is_speech = webrtc_result or final_is_speech
                    
            except Exception as e:
                logger.warning(f"WebRTC VAD error, falling back to energy-based: {e}")
        
        # Update session state
        current_time = time.time()
        if final_is_speech:
            session['is_speaking'] = True
            session['silence_start'] = None
        else:
            if session['is_speaking'] and session['silence_start'] is None:
                session['silence_start'] = current_time
            elif session['silence_start'] and current_time - session['silence_start'] > 1.5:
                session['is_speaking'] = False
        
        return final_is_speech
    
    def _should_process_speech(self, session: Dict) -> bool:
        """Determine if accumulated speech should be processed"""
        
        # Process if we have enough frames and detect end of speech
        if len(session['speech_frames']) < 10:  # Minimum frames
            return False
        
        # Process if silence detected after speech
        if session['silence_start'] and time.time() - session['silence_start'] > 0.8:
            return True
        
        # Process if we have too many frames (prevent buffer overflow)
        if len(session['speech_frames']) > 100:
            return True
        
        return False
    
    async def _process_accumulated_speech(self, session_id: str) -> Optional[Dict]:
        """Process accumulated speech frames"""
        
        session = self.active_sessions[session_id]
        
        if not session['speech_frames']:
            return None
        
        try:
            # Combine all speech frames
            combined_audio = bytearray()
            for frame in session['speech_frames']:
                combined_audio.extend(frame)
            
            # Convert to audio file for speech recognition
            audio_file_path = await self._save_audio_to_temp_file(combined_audio)
            
            # Transcribe speech
            transcription = await self.voice_service.speech_to_text(
                audio_file_path, 
                session['language']
            )
            
            if not transcription.strip():
                return None
            
            logger.info(f"Transcribed: {transcription}")
            
            # Process with AI
            ai_response = await self.voice_service.process_text_message(
                message=transcription,
                language=session['language'],
                session_id=session_id
            )
            
            # Generate audio response
            audio_response_path = await self.voice_service.text_to_speech(
                ai_response.response,
                session['language']
            )
            
            # Convert audio to base64 for streaming
            audio_base64 = await self._audio_to_base64(audio_response_path)
            
            return {
                'transcription': transcription,
                'ai_response': ai_response.response,
                'audio_response': audio_base64,
                'emergency_level': ai_response.emergency_level,
                'requires_hospital': ai_response.requires_hospital,
                'language': session['language']
            }
            
        except Exception as e:
            logger.error(f"Error processing speech: {e}")
            return {'error': str(e)}
    
    async def _save_audio_to_temp_file(self, audio_data: bytearray) -> str:
        """Save audio data to temporary WAV file"""
        
        import tempfile
        import os
        
        # Create temporary file
        temp_fd, temp_path = tempfile.mkstemp(suffix='.wav')
        
        try:
            with wave.open(temp_path, 'wb') as wav_file:
                wav_file.setnchannels(1)  # Mono
                wav_file.setsampwidth(2)  # 2 bytes per sample (int16)
                wav_file.setframerate(self.sample_rate)
                wav_file.writeframes(audio_data)
            
            return temp_path
            
        finally:
            os.close(temp_fd)
    
    async def _audio_to_base64(self, audio_file_path: str) -> str:
        """Convert audio file to base64 string"""
        
        try:
            with open(audio_file_path, 'rb') as audio_file:
                audio_bytes = audio_file.read()
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                return audio_base64
        except Exception as e:
            logger.error(f"Error converting audio to base64: {e}")
            return ""
    
    async def end_voice_session(self, session_id: str):
        """End a real-time voice session"""
        
        if session_id in self.active_sessions:
            # Clean up session
            await self.voice_service.end_session(session_id)
            del self.active_sessions[session_id]
            
        return {'status': 'ended', 'session_id': session_id}
    
    async def get_session_status(self, session_id: str) -> Dict:
        """Get status of a voice session"""
        
        if session_id not in self.active_sessions:
            return {'error': 'Session not found'}
        
        session = self.active_sessions[session_id]
        
        return {
            'session_id': session_id,
            'language': session['language'],
            'is_speaking': session['is_speaking'],
            'conversation_active': session['conversation_active'],
            'last_activity': session['last_activity'],
            'processing_audio': session['processing_audio']
        }
    
    def cleanup_inactive_sessions(self, timeout: int = 300):  # 5 minutes
        """Clean up inactive sessions"""
        
        current_time = time.time()
        inactive_sessions = []
        
        for session_id, session in self.active_sessions.items():
            if current_time - session['last_activity'] > timeout:
                inactive_sessions.append(session_id)
        
        for session_id in inactive_sessions:
            asyncio.create_task(self.end_voice_session(session_id))