import streamlit as st
import os
import speech_recognition as sr
from gtts import gTTS
import google.generativeai as genai
from dotenv import load_dotenv
import time
import tempfile
import base64
import json
from io import BytesIO
import pandas as pd
from hospital_data import INDIAN_HOSPITALS, EMERGENCY_CONDITIONS
from voice_components import (
    VoiceProcessor, AudioPlayer, voice_input_component, 
    audio_response_component, continuous_voice_mode, voice_settings_component
)

# --- STREAMLIT CONFIG ---
st.set_page_config(
    page_title="AI Health Agent - MediMitra",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CONFIGURATION ---
load_dotenv()

# Initialize session state
if 'conversation' not in st.session_state:
    st.session_state.conversation = []
if 'current_language' not in st.session_state:
    st.session_state.current_language = 'en'
if 'user_location' not in st.session_state:
    st.session_state.user_location = ''
if 'audio_enabled' not in st.session_state:
    st.session_state.audio_enabled = True
if 'diagnosis_context' not in st.session_state:
    st.session_state.diagnosis_context = {}

# API Key Configuration
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    st.error("❌ GOOGLE_API_KEY not found. Please set it in your .env file.")
    st.stop()

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    st.error(f"❌ Error configuring Gemini API: {e}")
    st.stop()

# Language configurations
LANGUAGES = {
    'en': {'name': 'English', 'flag': '🇺🇸', 'native': 'English'},
    'hi': {'name': 'Hindi', 'flag': '🇮🇳', 'native': 'हिंदी'},
    'gu': {'name': 'Gujarati', 'flag': '🇮🇳', 'native': 'ગુજરાતી'},
    'mr': {'name': 'Marathi', 'flag': '🇮🇳', 'native': 'मराठी'},
    'bn': {'name': 'Bengali', 'flag': '🇮🇳', 'native': 'বাংলা'},
    'ml': {'name': 'Malayalam', 'flag': '🇮🇳', 'native': 'മലയാളം'},
    'ur': {'name': 'Urdu', 'flag': '🇵🇰', 'native': 'اردو'}
}

SYSTEM_PROMPT = """
You are an advanced AI Health Agent with enhanced capabilities. Your goal is to provide comprehensive health guidance and coordinate medical care when needed.

## Persona & Tone
Your persona is calm, empathetic, and professional. Always be reassuring. Never use alarming language, but be clear and firm when a situation is serious.

## Core Safety Directive
**CRITICAL RULE:** You are an AI assistant, not a medical professional. You cannot diagnose conditions. Your primary function is to provide preliminary guidance based on patterns and coordinate appropriate care. Every interaction that gives advice must end with a clear disclaimer tailored to the situation's severity.

## Conversational Rules
1. **Smarter Information Gathering:** Before classifying a symptom, ask clarifying questions to understand its severity, duration, and associated symptoms.
2. **One Question at a Time:** Ask only ONE follow-up question at a time.
3. **Language Matching:** Respond in the same language the user is speaking.
4. **Graceful Conversation Endings:** End conversations politely when the user indicates they're done.

## Enhanced Triage & Care Coordination Protocol
You must classify the user's condition into one of four categories:

**1. HOME CARE - MILD Condition:**
   - Criteria: Common, not severe symptoms
   - Action: Provide detailed home care instructions
   - Disclaimer: "These symptoms can usually be managed at home. However, if symptoms worsen or don't improve in 2-3 days, please consult a healthcare provider."

**2. HOME CARE WITH MONITORING - MODERATE Condition:**
   - Criteria: Persistent but manageable symptoms
   - Action: Home care with close monitoring instructions
   - Disclaimer: "While these symptoms can often be managed at home, please monitor closely and seek medical care if symptoms worsen or don't improve within 24-48 hours."

**3. HOSPITAL CONSULTATION REQUIRED:**
   - Criteria: Symptoms requiring professional evaluation
   - Action: Recommend seeking medical attention within 24 hours
   - Include: Hospital suggestions based on location

**4. EMERGENCY - IMMEDIATE HOSPITAL CARE:**
   - Criteria: Life-threatening or urgent symptoms
   - Action: Immediate emergency care recommendation
   - Include: Emergency hospital contact and preparation instructions

Always ask for location when hospital care is recommended to provide specific hospital information.
"""

def find_nearest_hospitals(city, emergency_required=False, max_results=3):
    """Find nearest hospitals in a given city"""
    city_lower = city.lower().strip()
    
    # Try to match city name
    matched_city = None
    for city_key in INDIAN_HOSPITALS.keys():
        if city_lower in city_key or city_key in city_lower:
            matched_city = city_key
            break
    
    if not matched_city:
        # Try partial matching for major cities
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
    
    return hospitals[:max_results], None

def text_to_speech(text, language='en'):
    """Convert text to speech and return audio data"""
    try:
        # Create TTS object
        tts = gTTS(text=text, lang=language, slow=False)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tts.save(tmp_file.name)
            
            # Read the audio file
            with open(tmp_file.name, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Clean up
            os.unlink(tmp_file.name)
            
            return audio_data
    except Exception as e:
        st.error(f"Error generating speech: {e}")
        return None

def get_ai_response(user_input, language='en'):
    """Get AI response using Gemini API"""
    try:
        # Prepare the prompt with context
        context = f"""
        {SYSTEM_PROMPT}
        
        User's language preference: {LANGUAGES[language]['name']}
        User's location: {st.session_state.user_location if st.session_state.user_location else 'Not provided'}
        
        Previous conversation context: {json.dumps(st.session_state.conversation[-3:] if len(st.session_state.conversation) > 3 else st.session_state.conversation)}
        
        Current user input: {user_input}
        
        Please respond appropriately in {LANGUAGES[language]['name']} and classify the condition if health-related.
        If hospital care is recommended, ask for the user's location if not already provided.
        """
        
        response = model.generate_content(context)
        return response.text
    
    except Exception as e:
        return f"Sorry, I encountered an error: {e}. Please try again."

def display_hospital_card(hospital):
    """Display hospital information in a card format"""
    with st.container():
        st.markdown(f"""
        <div style="border: 1px solid #ddd; border-radius: 10px; padding: 15px; margin: 10px 0; background-color: #f9f9f9;">
            <h4 style="color: #2E8B57; margin-bottom: 10px;">🏥 {hospital['name']}</h4>
            <p><strong>📍 Address:</strong> {hospital['address']}</p>
            <p><strong>📞 Phone:</strong> {hospital['phone']}</p>
            {f"<p><strong>🚨 Emergency:</strong> {hospital.get('emergency_phone', hospital['phone'])}</p>" if hospital.get('emergency_services') else ""}
            {f"<p><strong>🩺 Specialties:</strong> {', '.join(hospital['specialties'])}</p>" if hospital.get('specialties') else ""}
            {f"<p style='color: #FF6347;'><strong>⚡ Emergency Services Available</strong></p>" if hospital.get('emergency_services') else ""}
        </div>
        """, unsafe_allow_html=True)

def main():
    # Custom CSS
    st.markdown("""
    <style>
    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .chat-message {
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        max-width: 80%;
    }
    .user-message {
        background-color: #e3f2fd;
        margin-left: auto;
    }
    .ai-message {
        background-color: #f1f8e9;
    }
    .emergency-alert {
        background-color: #ffebee;
        border-left: 5px solid #f44336;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 5px;
    }
    .stButton > button {
        background-color: #4CAF50;
        color: white;
        border-radius: 20px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: bold;
    }
    </style>
    """, unsafe_allow_html=True)

    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🏥 AI Health Agent - MediMitra</h1>
        <p>Your Intelligent Health Companion with Hospital Coordination</p>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Settings")
        
        # Language Selection
        st.subheader("🌐 Language")
        language_options = {f"{lang['flag']} {lang['native']}": code for code, lang in LANGUAGES.items()}
        selected_language = st.selectbox(
            "Choose your language:",
            options=list(language_options.keys()),
            index=0
        )
        st.session_state.current_language = language_options[selected_language]
        
        # Location Input
        st.subheader("📍 Location")
        st.session_state.user_location = st.text_input(
            "Your city (for hospital recommendations):",
            value=st.session_state.user_location,
            placeholder="e.g., Mumbai, Delhi, Bangalore"
        )
        
        # Audio Settings
        st.subheader("🔊 Audio Settings")
        st.session_state.audio_enabled = st.checkbox("Enable text-to-speech", value=True)
        
        # Voice settings component
        voice_settings_component()
        
        # Quick Actions
        st.subheader("🚀 Quick Actions")
        if st.button("🗑️ Clear Conversation"):
            st.session_state.conversation = []
            st.rerun()
        
        # Emergency Contacts
        st.subheader("🚨 Emergency")
        st.markdown("""
        **Emergency Numbers:**
        - 🚑 Ambulance: 108
        - 🚓 Police: 100
        - 🚒 Fire: 101
        """)

    # Main content area
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("💬 Health Consultation")
        
        # Chat interface
        chat_container = st.container()
        
        with chat_container:
            # Display conversation
            for message in st.session_state.conversation:
                if message['type'] == 'user':
                    st.markdown(f"""
                    <div class="chat-message user-message">
                        <strong>👤 You:</strong> {message['content']}
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class="chat-message ai-message">
                        <strong>🤖 AI Health Agent:</strong> {message['content']}
                        {f"<br><small>📞 Voice Input</small>" if message.get('input_type') == 'voice' else ""}
                        {f"<br><small>📞 Continuous Voice</small>" if message.get('input_type') == 'continuous_voice' else ""}
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Play audio if enabled and available
                    if st.session_state.audio_enabled and 'audio' in message:
                        audio_html = AudioPlayer.create_audio_player(message['audio'])
                        if audio_html:
                            st.markdown(audio_html, unsafe_allow_html=True)
        
        # Input area
        st.subheader("💭 Describe your symptoms or health concerns:")
        
        # Tabs for different input methods
        tab1, tab2, tab3 = st.tabs(["💬 Text Input", "🎤 Voice Input", "📞 Continuous Voice"])
        
        with tab1:
            # Text input
            user_input = st.text_area(
                "Type your message:",
                height=100,
                placeholder="e.g., I have a headache and fever since yesterday...",
                key="text_input"
            )
            
            # Send button
            if st.button("📤 Send Message", disabled=not user_input.strip(), key="send_text"):
                if user_input.strip():
                    # Add user message
                    st.session_state.conversation.append({
                        'type': 'user',
                        'content': user_input,
                        'timestamp': time.time()
                    })
                    
                    # Get AI response
                    with st.spinner("🤔 AI is thinking..."):
                        ai_response = get_ai_response(user_input, st.session_state.current_language)
                    
                    # Generate audio if enabled
                    audio_data = None
                    if st.session_state.audio_enabled:
                        with st.spinner("🗣️ Generating speech..."):
                            audio_data = text_to_speech(ai_response, st.session_state.current_language)
                    
                    # Add AI response
                    ai_message = {
                        'type': 'ai',
                        'content': ai_response,
                        'timestamp': time.time()
                    }
                    
                    if audio_data:
                        ai_message['audio'] = audio_data
                    
                    st.session_state.conversation.append(ai_message)
                    st.rerun()
        
        with tab2:
            # Voice input component
            voice_text = voice_input_component(st.session_state.current_language)
            
            if voice_text:
                # Process voice input same as text
                st.session_state.conversation.append({
                    'type': 'user',
                    'content': voice_text,
                    'timestamp': time.time(),
                    'input_type': 'voice'
                })
                
                # Get AI response
                with st.spinner("🤔 AI is thinking..."):
                    ai_response = get_ai_response(voice_text, st.session_state.current_language)
                
                # Generate audio if enabled
                audio_data = None
                if st.session_state.audio_enabled:
                    with st.spinner("🗣️ Generating speech..."):
                        audio_data = text_to_speech(ai_response, st.session_state.current_language)
                
                # Add AI response
                ai_message = {
                    'type': 'ai',
                    'content': ai_response,
                    'timestamp': time.time()
                }
                
                if audio_data:
                    ai_message['audio'] = audio_data
                
                st.session_state.conversation.append(ai_message)
                st.rerun()
        
        with tab3:
            # Continuous voice mode
            continuous_text = continuous_voice_mode()
            
            if continuous_text:
                # Process continuous voice input
                st.session_state.conversation.append({
                    'type': 'user',
                    'content': continuous_text,
                    'timestamp': time.time(),
                    'input_type': 'continuous_voice'
                })
                
                # Get AI response
                with st.spinner("🤔 AI is thinking..."):
                    ai_response = get_ai_response(continuous_text, st.session_state.current_language)
                
                # Generate audio if enabled
                audio_data = None
                if st.session_state.audio_enabled:
                    with st.spinner("🗣️ Generating speech..."):
                        audio_data = text_to_speech(ai_response, st.session_state.current_language)
                
                # Add AI response
                ai_message = {
                    'type': 'ai',
                    'content': ai_response,
                    'timestamp': time.time()
                }
                
                if audio_data:
                    ai_message['audio'] = audio_data
                
                st.session_state.conversation.append(ai_message)
                st.rerun()
    
    with col2:
        st.header("🏥 Hospital Search")
        
        # Hospital search
        if st.session_state.user_location:
            search_emergency = st.checkbox("🚨 Emergency services required", value=False)
            
            if st.button("🔍 Find Hospitals"):
                with st.spinner("🔍 Searching hospitals..."):
                    hospitals, error = find_nearest_hospitals(
                        st.session_state.user_location, 
                        emergency_required=search_emergency,
                        max_results=5
                    )
                
                if error:
                    st.error(error)
                elif hospitals:
                    st.success(f"Found {len(hospitals)} hospitals in {st.session_state.user_location}")
                    for hospital in hospitals:
                        display_hospital_card(hospital)
                else:
                    st.warning("No hospitals found.")
        else:
            st.info("📍 Please enter your location in the sidebar to search for hospitals.")
        
        # Quick symptom checker
        st.header("🔍 Quick Symptom Checker")
        
        common_symptoms = [
            "Fever", "Headache", "Cough", "Sore throat", 
            "Stomach pain", "Chest pain", "Shortness of breath",
            "Nausea", "Dizziness", "Back pain"
        ]
        
        selected_symptoms = st.multiselect(
            "Select your symptoms:",
            options=common_symptoms
        )
        
        if selected_symptoms and st.button("💡 Get Quick Assessment"):
            symptom_text = f"I have the following symptoms: {', '.join(selected_symptoms)}"
            
            # Add to conversation
            st.session_state.conversation.append({
                'type': 'user',
                'content': symptom_text,
                'timestamp': time.time()
            })
            
            # Get AI response
            with st.spinner("🤔 Analyzing symptoms..."):
                ai_response = get_ai_response(symptom_text, st.session_state.current_language)
            
            # Generate audio if enabled
            audio_data = None
            if st.session_state.audio_enabled:
                audio_data = text_to_speech(ai_response, st.session_state.current_language)
            
            # Add AI response
            ai_message = {
                'type': 'ai',
                'content': ai_response,
                'timestamp': time.time()
            }
            
            if audio_data:
                ai_message['audio'] = audio_data
            
            st.session_state.conversation.append(ai_message)
            st.rerun()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 1rem; background-color: #f0f2f6; border-radius: 10px;">
        <p><strong>⚠️ Medical Disclaimer:</strong> This AI assistant is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers.</p>
        <p><small>© 2025 MediMitra - AI Health Agent | Powered by Google Gemini</small></p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()