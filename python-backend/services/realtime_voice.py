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
    
    async def process_text_input(self, session_id: str, text: str, language: str = "en") -> Dict[str, Any]:
        """Process text input directly (fallback when voice isn't working)"""
        
        if session_id not in self.active_sessions:
            logger.warning(f"No active session found for {session_id}")
            return {"error": "No active session"}
        
        session = self.active_sessions[session_id]
        session['last_activity'] = time.time()
        
        logger.info(f"💬 Processing text input: {text}")
        
        try:
            # Use voice assistant to process the text directly
            chat_response = await self.voice_service.process_text_message(text, language)
            
            # Convert ChatResponse to dictionary
            result = {
                "ai_response": chat_response.response,
                "language": chat_response.language,
                "requires_hospital": chat_response.requires_hospital,
                "emergency_level": chat_response.emergency_level,
                "session_id": session_id,
                "timestamp": time.time()
            }
            
            logger.info(f"💬 Text processing completed for session {session_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing text input: {e}")
            return {
                "error": f"Text processing failed: {str(e)}",
                "session_id": session_id
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
                'voice_detected': bool(voice_detected),  # Ensure JSON serializable
                'is_processing': bool(session['processing_audio']),  # Ensure JSON serializable
                'timestamp': float(time.time())  # Ensure JSON serializable
            }
            
            # If voice activity detected, process the audio chunk directly
            if voice_detected and not session['processing_audio']:
                logger.info(f"🎤 Voice detected, processing audio chunk directly...")
                session['processing_audio'] = True
                
                # Process this audio chunk immediately
                speech_result = await self._process_audio_chunk_directly(session_id, audio_data)
                if speech_result:
                    logger.info(f"🎤 Speech processing completed: {list(speech_result.keys())}")
                    response.update(speech_result)
                
                session['processing_audio'] = False
            
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
    
    async def _process_audio_chunk_directly(self, session_id: str, audio_data: bytes) -> Optional[Dict]:
        """Process a single audio chunk directly for speech recognition"""
        
        session = self.active_sessions[session_id]
        
        try:
            logger.info(f"🎤 Processing single audio chunk: {len(audio_data)} bytes")
            
            # Convert to audio file for speech recognition
            audio_file_path = await self._save_audio_to_temp_file(bytearray(audio_data))
            
            # Transcribe speech
            transcription = await self.voice_service.speech_to_text(
                audio_file_path, 
                session['language']
            )
            
            if not transcription or not transcription.strip():
                logger.info(f"🎤 No transcription from audio chunk")
                return None
            
            logger.info(f"🎤 Transcribed: {transcription}")
            
            # Process with AI (with timeout)
            logger.info(f"🤖 Starting AI response generation...")
            try:
                ai_response = await asyncio.wait_for(
                    self.voice_service.process_text_message(
                        message=transcription,
                        language=session['language'],
                        session_id=session_id
                    ),
                    timeout=30.0  # 30 second timeout
                )
                logger.info(f"🤖 AI response generated: {ai_response.response[:100]}...")
            except asyncio.TimeoutError:
                logger.error(f"🤖 AI response generation timed out after 30 seconds")
                return {
                    'transcription': transcription,
                    'ai_response': "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                    'audio_response': "",
                    'emergency_level': "none", 
                    'requires_hospital': False,
                    'language': session['language']
                }
            except Exception as ai_error:
                logger.error(f"🤖 AI response generation failed: {ai_error}")
                return {
                    'transcription': transcription,
                    'ai_response': "I'm sorry, I encountered an error processing your request.",
                    'audio_response': "",
                    'emergency_level': "none",
                    'requires_hospital': False, 
                    'language': session['language']
                }
            
            # Generate audio response
            logger.info(f"🎵 Starting audio response generation...")
            audio_response_path = None
            try:
                audio_response_path = await asyncio.wait_for(
                    self.voice_service.text_to_speech(
                        ai_response.response,
                        session['language']
                    ),
                    timeout=35.0  # Increased timeout to allow for 3 retries (10s each + 6s backoff)
                )
                if audio_response_path:
                    logger.info(f"🎵 Audio response generated successfully")
                else:
                    logger.info(f"🎵 No audio response available - continuing with text only")
            except asyncio.TimeoutError:
                logger.error(f"🎵 Audio response generation timed out after 35 seconds")
                audio_response_path = None
            except Exception as tts_error:
                logger.error(f"🎵 Audio response generation failed: {tts_error}")
                # Continue without audio - text response is more important
                audio_response_path = None
            
            # Convert audio to base64 for streaming
            audio_base64 = ""
            if audio_response_path and audio_response_path is not None:
                try:
                    audio_base64 = await self._audio_to_base64(audio_response_path)
                    logger.info(f"🎵 Audio converted to base64: {len(audio_base64)} chars")
                except Exception as b64_error:
                    logger.error(f"🎵 Audio base64 conversion failed: {b64_error}")
                    audio_base64 = ""
            else:
                logger.info(f"🎵 No audio response available - continuing with text only")
            
            return {
                'transcription': transcription,
                'ai_response': ai_response.response,
                'audio_response': audio_base64,
                'emergency_level': ai_response.emergency_level,
                'requires_hospital': bool(ai_response.requires_hospital),
                'language': session['language']
            }
            
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")
            return None

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
                'requires_hospital': bool(ai_response.requires_hospital),  # Ensure JSON serializable
                'language': session['language']
            }
            
        except Exception as e:
            logger.error(f"Error processing speech: {e}")
            return {'error': str(e)}
    
    async def _save_audio_to_temp_file(self, audio_data: bytearray) -> str:
        """Save audio data to temporary WAV file with proper format conversion"""
        
        import tempfile
        import os
        
        # Create temporary file for the received audio (WebM format)
        temp_input_fd, temp_input_path = tempfile.mkstemp(suffix='.webm')
        # Create temporary file for the converted WAV audio
        temp_output_fd, temp_output_path = tempfile.mkstemp(suffix='.wav')
        
        try:
            # Write the received audio data to input file
            with os.fdopen(temp_input_fd, 'wb') as f:
                f.write(audio_data)
            
            # Convert WebM to WAV using ffmpeg (if available) or fall back to direct write
            try:
                import subprocess
                # Try to convert using ffmpeg
                result = subprocess.run([
                    'ffmpeg', '-i', temp_input_path, 
                    '-ar', '16000',  # 16kHz sample rate
                    '-ac', '1',      # Mono
                    '-acodec', 'pcm_s16le',  # 16-bit PCM
                    '-y',            # Overwrite output
                    temp_output_path
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    logger.info(f"🔄 Successfully converted audio using ffmpeg")
                    os.close(temp_output_fd)  # Close the file descriptor
                    return temp_output_path
                else:
                    logger.warning(f"⚠️ ffmpeg conversion failed: {result.stderr}")
                    
            except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
                logger.warning(f"⚠️ ffmpeg not available or failed: {e}")
            
            # Fallback: Try to write as WAV directly (may not work for WebM)
            os.close(temp_output_fd)  # Close before writing
            with open(temp_output_path, 'wb') as f:
                # Write simple WAV header for 16kHz mono 16-bit PCM
                import struct
                sample_rate = 16000
                num_channels = 1
                bits_per_sample = 16
                
                # Calculate sizes
                data_size = len(audio_data)
                chunk_size = 36 + data_size
                
                # Write WAV header
                f.write(b'RIFF')
                f.write(struct.pack('<L', chunk_size))
                f.write(b'WAVE')
                f.write(b'fmt ')
                f.write(struct.pack('<L', 16))  # fmt chunk size
                f.write(struct.pack('<H', 1))   # PCM format
                f.write(struct.pack('<H', num_channels))
                f.write(struct.pack('<L', sample_rate))
                f.write(struct.pack('<L', sample_rate * num_channels * bits_per_sample // 8))
                f.write(struct.pack('<H', num_channels * bits_per_sample // 8))
                f.write(struct.pack('<H', bits_per_sample))
                f.write(b'data')
                f.write(struct.pack('<L', data_size))
                f.write(audio_data)
                
            logger.info(f"🔄 Created WAV file with manual header")
            return temp_output_path
            
        except Exception as e:
            logger.error(f"Error saving audio file: {e}")
            # Clean up files
            try:
                os.unlink(temp_input_path)
                os.unlink(temp_output_path)
            except:
                pass
            raise
        finally:
            # Clean up input file
            try:
                os.unlink(temp_input_path)
            except:
                pass
    
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