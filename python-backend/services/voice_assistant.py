"""
Voice Assistant Service - Core business logic for the voice assistant
"""

import os
import tempfile
import asyncio
from datetime import datetime
import uuid
from typing import Optional, Dict, List, Any
import json
import logging

# Try to import speech recognition - make it optional
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("Warning: speech_recognition not available. Voice features will be limited.")

from gtts import gTTS
import google.generativeai as genai

from .hospital_data import INDIAN_HOSPITALS, EMERGENCY_CONDITIONS
from models.schemas import (
    ChatResponse, 
    HospitalSearchResponse, 
    HospitalInfo,
    TranscriptionResponse
)

# Set up logger
logger = logging.getLogger(__name__)

class VoiceAssistantService:
    def __init__(self):
        """Initialize the voice assistant service"""
        # Configure Google Generative AI
        try:
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        except TypeError:
            raise Exception("GOOGLE_API_KEY not found. Please check your .env file.")
        
        # System prompt for the AI
        self.system_prompt = """
        You are an advanced AI Health Agent with enhanced capabilities. Your goal is to provide comprehensive health guidance and coordinate medical care when needed.

        ## Persona & Tone
        Your persona is calm, empathetic, and professional. Always be reassuring. Never use alarming language, but be clear and firm when a situation is serious.

        ## Core Safety Directive
        **CRITICAL RULE:** You are an AI assistant, not a medical professional. You cannot diagnose conditions. Your primary function is to provide preliminary guidance based on patterns and coordinate appropriate care. Every interaction that gives advice must end with a clear disclaimer tailored to the situation's severity.

        ## Conversational Rules
        1. **Smarter Information Gathering:** Before classifying a symptom, ask clarifying questions to understand its severity, duration, and associated symptoms.
        2. **One Question at a Time:** Ask only ONE follow-up question at a time. Wait for the user's answer before asking the next one.
        3. **Language Matching:** Respond in the same language the user is speaking.
        4. **Graceful Conversation Endings:** If you ask the user if they need more help and they respond negatively, end the conversation politely.

        ## Enhanced Triage & Care Coordination Protocol
        You must classify the user's condition into one of four categories:

        **1. HOME CARE - MILD Condition:** Common symptoms that can be managed at home.
        **2. HOME CARE WITH MONITORING - MODERATE Condition:** Symptoms that need monitoring.
        **3. HOSPITAL CONSULTATION REQUIRED:** Symptoms requiring professional evaluation.
        **4. EMERGENCY - IMMEDIATE HOSPITAL REQUIRED:** Symptoms requiring immediate emergency attention.
        """
        
        # Language configurations
        self.language_configs = {
            'en': {'stt': 'en-IN', 'tts': 'en', 'name': 'English'},
            'hi': {'stt': 'hi-IN', 'tts': 'hi', 'name': 'Hindi'},
            'gu': {'stt': 'gu-IN', 'tts': 'gu', 'name': 'Gujarati'},
            'mr': {'stt': 'mr-IN', 'tts': 'mr', 'name': 'Marathi'},
            'bn': {'stt': 'bn-IN', 'tts': 'bn', 'name': 'Bengali'},
            'ml': {'stt': 'ml-IN', 'tts': 'ml', 'name': 'Malayalam'},
            'ur': {'stt': 'ur-IN', 'tts': 'ur', 'name': 'Urdu'}
        }
        
        # Initialize speech recognition only if available
        if SPEECH_RECOGNITION_AVAILABLE:
            self.recognizer = sr.Recognizer()
        else:
            self.recognizer = None
        
        # Session storage (in production, use Redis or database)
        self.sessions: Dict[str, Dict] = {}
        
        # Initialize AI model
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=self.system_prompt
        )

    async def start_session(self, language: str = "en") -> str:
        """Start a new conversation session"""
        session_id = str(uuid.uuid4())
        
        self.sessions[session_id] = {
            'language': language,
            'created_at': datetime.now(),
            'last_activity': datetime.now(),
            'message_count': 0,
            'chat_history': self.model.start_chat(history=[])
        }
        
        return session_id

    async def end_session(self, session_id: str):
        """End a conversation session"""
        if session_id in self.sessions:
            del self.sessions[session_id]

    async def get_session(self, session_id: Optional[str]) -> Dict:
        """Get or create session"""
        if not session_id or session_id not in self.sessions:
            new_session_id = await self.start_session()
            return self.sessions[new_session_id], new_session_id
        
        # Update last activity
        self.sessions[session_id]['last_activity'] = datetime.now()
        return self.sessions[session_id], session_id

    async def get_greeting(self, language: str) -> str:
        """Get greeting message in specified language"""
        greetings = {
            'en': "Hello, I am your personal health assistant. How are you feeling today?",
            'hi': "नमस्ते, मैं आपका व्यक्तिगत स्वास्थ्य सहायक हूँ। आप आज कैसा महसूस कर रहे हैं?",
            'gu': "નમસ્તે, હું તમારો અંગત આરોગ્ય સહાયક છું. આજે તમને કેવું લાગે છે?",
            'mr': "नमस्कार, मी तुमचा वैयक्तिक आरोग्य सहाय्यक आहे. तुम्हाला आज कसे वाटत आहे?",
            'bn': "নমস্কার, আমি আপনার ব্যক্তিগত স্বাস্থ্য সহায়ক। আপনি আজ কেমন অনুভব করছেন?",
            'ml': "നമസ്കാരം, ഞാൻ നിങ്ങളുടെ സ്വകാര്യ ആരോഗ്യ സഹായിയാണ്. നിങ്ങൾക്ക് ഇന്ന് എന്തു തോന്നുന്നു?",
            'ur': "ہیلو، میں آپ کا ذاتی ہیلتھ اسسٹنٹ ہوں۔ آج آپ کیسی طبیعت ہے؟"
        }
        return greetings.get(language, greetings['en'])

    async def process_text_message(
        self, 
        message: str, 
        language: str = "en", 
        session_id: Optional[str] = None
    ) -> ChatResponse:
        """Process text message and return response"""
        
        # Get or create session
        session, session_id = await self.get_session(session_id)
        chat = session['chat_history']
        
        # Update session
        session['message_count'] += 1
        session['language'] = language
        
        try:
            # Check if this is a potential emergency
            is_emergency = self._check_emergency_keywords(message.lower())
            
            # Create enhanced prompt
            lang_name = self.language_configs.get(language, {}).get('name', 'English')
            enhanced_prompt = f"""
            Your response must be in {lang_name}. The user said: {message}
            
            Current conversation context: The user is describing health symptoms and you need to assess the appropriate level of care needed.
            """
            
            # Get AI response
            response = chat.send_message(enhanced_prompt)
            ai_response = response.text
            
            # Determine emergency level and hospital requirement
            emergency_level = self._assess_emergency_level(message, ai_response)
            requires_hospital = self._check_hospital_requirement(ai_response)
            
            return ChatResponse(
                response=ai_response,
                language=language,
                session_id=session_id,
                timestamp=datetime.now(),
                requires_hospital=requires_hospital,
                emergency_level=emergency_level
            )
            
        except Exception as e:
            raise Exception(f"Error processing message: {str(e)}")

    async def process_voice_message(
        self, 
        audio_path: str, 
        language: str = "en", 
        session_id: Optional[str] = None
    ) -> ChatResponse:
        """Process voice message and return response with audio"""
        
        # Transcribe audio to text
        transcription = await self.speech_to_text(audio_path, language)
        
        if not transcription:
            raise Exception("Could not transcribe audio")
        
        # Process the transcribed text
        text_response = await self.process_text_message(transcription, language, session_id)
        
        # Generate audio response
        audio_url = await self.text_to_speech(text_response.response, language)
        text_response.audio_url = audio_url
        
        return text_response

    async def speech_to_text(self, audio_path: str, language: str = "en") -> str:
        """Convert speech to text with multiple fallback methods"""
        if not SPEECH_RECOGNITION_AVAILABLE or not self.recognizer:
            raise Exception("Speech recognition not available. Please install speechrecognition and pyaudio packages.")
        
        try:
            lang_config = self.language_configs.get(language, self.language_configs['en'])
            stt_lang = lang_config['stt']
            
            # For WebM files, try to handle them as audio files
            try:
                with sr.AudioFile(audio_path) as source:
                    # Adjust for ambient noise
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.1)
                    audio = self.recognizer.record(source)
                
                # Try multiple recognition services in order of preference
                recognition_methods = [
                    # Method 1: Try Google Web Speech API (free, no auth required)
                    lambda: self.recognizer.recognize_google(audio, language=stt_lang, show_all=False),
                    # Method 2: Try Sphinx (offline, lower quality but no internet required)
                    lambda: self.recognizer.recognize_sphinx(audio) if hasattr(self.recognizer, 'recognize_sphinx') else None,
                ]
                
                for i, method in enumerate(recognition_methods):
                    try:
                        logger.info(f"🎤 Trying speech recognition method {i+1}...")
                        text = method()
                        if text and text.strip():
                            logger.info(f"✅ Successfully transcribed with method {i+1}: {text}")
                            return text.strip()
                        else:
                            logger.warning(f"⚠️ Method {i+1} returned empty result")
                    except sr.RequestError as e:
                        logger.warning(f"⚠️ Method {i+1} failed with request error: {str(e)}")
                        if "Service Unavailable" in str(e) and i == 0:
                            logger.info("🔄 Google Speech API unavailable, trying alternative methods...")
                        continue
                    except Exception as e:
                        logger.warning(f"⚠️ Method {i+1} failed with error: {str(e)}")
                        continue
                
                # If all methods failed, return empty string
                logger.warning("❌ All speech recognition methods failed")
                return ""
                
            except Exception as audio_error:
                logger.warning(f"Standard audio file processing failed: {audio_error}")
                # If that fails, maybe the file format is not supported
                return ""
            
        except sr.UnknownValueError:
            logger.warning("Could not understand audio - speech was unclear or silent")
            return ""
        except Exception as e:
            logger.error(f"Unexpected speech recognition error: {str(e)}")
            return ""

    async def text_to_speech(self, text: str, language: str = "en") -> Optional[str]:
        """Convert text to speech and return file path, or None if failed"""
        try:
            lang_config = self.language_configs.get(language, self.language_configs['en'])
            tts_lang = lang_config['tts']
            
            # Generate unique filename
            filename = f"response_{uuid.uuid4().hex[:8]}.mp3"
            filepath = os.path.join(tempfile.gettempdir(), filename)
            
            logger.info(f"🎵 Creating TTS for text: {text[:50]}... in language: {tts_lang}")
            
            # Create TTS with improved retry mechanism and timeout
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    # Create TTS with timeout
                    tts_task = asyncio.create_task(self._create_tts_with_timeout(text, tts_lang, filepath))
                    await asyncio.wait_for(tts_task, timeout=10.0)  # 10 second timeout per attempt
                    
                    # Verify file was created and has content
                    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                        logger.info(f"🎵 TTS file created successfully: {filepath} ({os.path.getsize(filepath)} bytes)")
                        return filepath
                    else:
                        raise Exception("TTS file was not created or is empty")
                        
                except asyncio.TimeoutError:
                    logger.warning(f"🎵 TTS attempt {attempt + 1} timed out after 10 seconds")
                    if os.path.exists(filepath):
                        try:
                            os.remove(filepath)
                        except:
                            pass
                except Exception as retry_error:
                    logger.warning(f"🎵 TTS attempt {attempt + 1} failed: {retry_error}")
                    if os.path.exists(filepath):
                        try:
                            os.remove(filepath)
                        except:
                            pass
                
                # Wait before retry (exponential backoff)
                if attempt < max_retries - 1:
                    wait_time = 1 + (attempt * 2)  # 1s, 3s, 5s
                    logger.info(f"🎵 Waiting {wait_time}s before retry...")
                    await asyncio.sleep(wait_time)
            
            logger.error(f"🎵 All TTS attempts failed after {max_retries} retries")
            return None
            
        except Exception as e:
            logger.error(f"🎵 Unexpected TTS error: {str(e)}")
            return None

    async def _create_tts_with_timeout(self, text: str, tts_lang: str, filepath: str):
        """Create TTS file with proper async handling"""
        def _sync_tts_creation():
            tts = gTTS(text=text, lang=tts_lang, slow=False)
            tts.save(filepath)
        
        # Run TTS creation in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _sync_tts_creation)

    async def search_hospitals(
        self, 
        city: str, 
        emergency_required: bool = False, 
        max_results: int = 3
    ) -> HospitalSearchResponse:
        """Search for hospitals in a given city"""
        
        try:
            hospitals, error_msg = self._find_nearest_hospitals(city, emergency_required, max_results)
            
            if error_msg:
                return HospitalSearchResponse(
                    hospitals=[],
                    city=city,
                    total_found=0,
                    error_message=error_msg
                )
            
            # Convert to HospitalInfo objects
            hospital_infos = []
            for hospital in hospitals:
                hospital_info = HospitalInfo(
                    name=hospital['name'],
                    address=hospital['address'],
                    phone=hospital['phone'],
                    emergency_phone=hospital.get('emergency_phone'),
                    specialties=hospital.get('specialties', []),
                    emergency_services=hospital.get('emergency_services', False),
                    latitude=hospital.get('latitude'),
                    longitude=hospital.get('longitude')
                )
                hospital_infos.append(hospital_info)
            
            return HospitalSearchResponse(
                hospitals=hospital_infos,
                city=city,
                total_found=len(hospital_infos)
            )
            
        except Exception as e:
            return HospitalSearchResponse(
                hospitals=[],
                city=city,
                total_found=0,
                error_message=str(e)
            )

    def _find_nearest_hospitals(self, city: str, emergency_required: bool = False, max_results: int = 3):
        """Find nearest hospitals in a given city - copied from original code"""
        city_lower = city.lower().strip()
        
        # Try to match city name
        matched_city = None
        for city_key in INDIAN_HOSPITALS.keys():
            if city_lower in city_key or city_key in city_lower:
                matched_city = city_key
                break
        
        if not matched_city:
            # Try partial matching for major cities including areas
            city_mappings = {
                'mumbai': ['bombay', 'mumbai', 'bandra', 'andheri', 'mahim', 'worli', 'colaba', 'powai'],
                'delhi': ['new delhi', 'delhi', 'ncr', 'gurgaon', 'noida'],
                'bangalore': ['bengaluru', 'bangalore', 'whitefield', 'koramangala'],
                'chennai': ['madras', 'chennai', 'anna nagar', 'velachery'],
                'kolkata': ['calcutta', 'kolkata', 'salt lake'],
                'hyderabad': ['hyderabad', 'secunderabad', 'hitech city'],
                'pune': ['pune', 'poona', 'baner', 'hinjewadi'],
                'ahmedabad': ['ahmedabad', 'amdavad', 'sg highway']
            }
            
            for city_key, variations in city_mappings.items():
                if any(variation in city_lower for variation in variations):
                    matched_city = city_key
                    break
        
        if not matched_city:
            return None, f"Sorry, I don't have hospital data for {city}. Please try a major city like Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, or Ahmedabad."
        
        hospitals = INDIAN_HOSPITALS[matched_city]
        
        if emergency_required:
            hospitals = [h for h in hospitals if h.get('emergency_services', False)]
        
        # Return top hospitals (already sorted by preference in data)
        return hospitals[:max_results], None

    def _check_emergency_keywords(self, text: str) -> bool:
        """Check if text contains emergency keywords"""
        return any(condition in text for condition in EMERGENCY_CONDITIONS)

    def _assess_emergency_level(self, user_input: str, ai_response: str) -> str:
        """Assess the emergency level based on input and response"""
        user_lower = user_input.lower()
        response_lower = ai_response.lower()
        
        # Emergency keywords
        emergency_keywords = ['emergency', 'urgent', 'immediately', 'call now', 'ambulance']
        high_keywords = ['hospital', 'doctor', 'medical attention', 'seek care']
        moderate_keywords = ['monitor', 'watch for', 'if symptoms worsen']
        
        if any(keyword in response_lower for keyword in emergency_keywords):
            return "emergency"
        elif any(keyword in response_lower for keyword in high_keywords):
            return "high"
        elif any(keyword in response_lower for keyword in moderate_keywords):
            return "moderate"
        else:
            return "low"

    def _check_hospital_requirement(self, ai_response: str) -> bool:
        """Check if AI response indicates hospital requirement"""
        response_lower = ai_response.lower()
        hospital_indicators = [
            'hospital', 'emergency', 'doctor', 'medical attention', 
            'seek care', 'consult', 'urgent', 'immediately'
        ]
        return any(indicator in response_lower for indicator in hospital_indicators)