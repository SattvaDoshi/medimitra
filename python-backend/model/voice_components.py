import streamlit as st
import speech_recognition as sr
from gtts import gTTS
import tempfile
import os
import base64
from io import BytesIO
import pyaudio
import wave
import threading
import queue
import time

class VoiceProcessor:
    """Handles voice recording and speech recognition"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.is_recording = False
        self.audio_queue = queue.Queue()
        
    def adjust_for_ambient_noise(self):
        """Adjust microphone sensitivity for ambient noise"""
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
        except Exception as e:
            st.error(f"Error adjusting for ambient noise: {e}")
    
    def record_audio_chunk(self, duration=5):
        """Record audio for specified duration"""
        try:
            with self.microphone as source:
                st.info("🎤 Listening... Speak now!")
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=duration)
                return audio
        except sr.WaitTimeoutError:
            return None
        except Exception as e:
            st.error(f"Error recording audio: {e}")
            return None
    
    def speech_to_text(self, audio_data, language='en-US'):
        """Convert speech to text using Google Speech Recognition"""
        try:
            if audio_data is None:
                return None
                
            # Language mapping for speech recognition
            lang_map = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'gu': 'gu-IN',
                'mr': 'mr-IN',
                'bn': 'bn-IN',
                'ml': 'ml-IN',
                'ur': 'ur-PK'
            }
            
            recognition_language = lang_map.get(language, 'en-US')
            
            # Try Google Speech Recognition first
            try:
                text = self.recognizer.recognize_google(audio_data, language=recognition_language)
                return text
            except sr.RequestError:
                # Fallback to offline recognition
                try:
                    text = self.recognizer.recognize_sphinx(audio_data)
                    return text
                except:
                    return None
                    
        except sr.UnknownValueError:
            return None
        except Exception as e:
            st.error(f"Speech recognition error: {e}")
            return None

class AudioPlayer:
    """Handles audio playback for text-to-speech"""
    
    @staticmethod
    def text_to_speech_advanced(text, language='en', slow=False):
        """Convert text to speech with enhanced options"""
        try:
            # Language mapping for TTS
            tts_lang_map = {
                'en': 'en',
                'hi': 'hi',
                'gu': 'gu',
                'mr': 'mr',
                'bn': 'bn',
                'ml': 'ml',
                'ur': 'ur'
            }
            
            tts_language = tts_lang_map.get(language, 'en')
            
            # Create TTS object
            tts = gTTS(text=text, lang=tts_language, slow=slow)
            
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
            st.error(f"Text-to-speech error: {e}")
            return None
    
    @staticmethod
    def create_audio_player(audio_data):
        """Create an audio player widget for Streamlit"""
        if audio_data:
            # Encode audio data to base64 for HTML audio player
            audio_base64 = base64.b64encode(audio_data).decode()
            audio_html = f"""
            <audio controls autoplay style="width: 100%;">
                <source src="data:audio/mp3;base64,{audio_base64}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>
            """
            return audio_html
        return None

def voice_input_component(language='en'):
    """Streamlit component for voice input"""
    
    st.subheader("🎤 Voice Input")
    
    # Initialize voice processor
    if 'voice_processor' not in st.session_state:
        st.session_state.voice_processor = VoiceProcessor()
    
    voice_processor = st.session_state.voice_processor
    
    # Voice recording controls
    col1, col2, col3 = st.columns([1, 1, 1])
    
    with col1:
        if st.button("🎤 Start Recording", key="start_recording"):
            # Adjust for ambient noise
            voice_processor.adjust_for_ambient_noise()
            st.session_state.is_recording = True
    
    with col2:
        record_duration = st.slider("Recording Duration (seconds)", 3, 10, 5)
    
    with col3:
        if st.button("🔇 Test Microphone", key="test_mic"):
            try:
                # Test microphone availability
                mic_test = sr.Microphone()
                with mic_test as source:
                    st.success("✅ Microphone working!")
            except Exception as e:
                st.error(f"❌ Microphone error: {e}")
    
    # Recording process
    if st.session_state.get('is_recording', False):
        with st.spinner(f"🎤 Recording for {record_duration} seconds..."):
            audio_data = voice_processor.record_audio_chunk(duration=record_duration)
            
            if audio_data:
                st.success("✅ Recording completed!")
                
                # Convert speech to text
                with st.spinner("🔄 Converting speech to text..."):
                    transcribed_text = voice_processor.speech_to_text(audio_data, language)
                
                if transcribed_text:
                    st.success(f"📝 Transcribed: **{transcribed_text}**")
                    st.session_state.voice_input = transcribed_text
                    
                    # Option to use this text
                    if st.button("✅ Use This Text", key="use_voice_text"):
                        return transcribed_text
                else:
                    st.warning("🤔 Could not understand the audio. Please try again.")
            else:
                st.warning("🔇 No audio detected. Please speak louder or check your microphone.")
        
        st.session_state.is_recording = False
    
    return None

def audio_response_component(text, language='en', auto_play=False):
    """Streamlit component for audio responses"""
    
    if not text:
        return
    
    st.subheader("🔊 Audio Response")
    
    # Generate audio
    audio_data = AudioPlayer.text_to_speech_advanced(text, language)
    
    if audio_data:
        # Create audio player
        audio_html = AudioPlayer.create_audio_player(audio_data)
        
        if audio_html:
            # Display audio player
            st.markdown("**🗣️ AI Response Audio:**")
            st.markdown(audio_html, unsafe_allow_html=True)
            
            # Download option
            st.download_button(
                label="💾 Download Audio",
                data=audio_data,
                file_name=f"ai_response_{int(time.time())}.mp3",
                mime="audio/mp3"
            )
    else:
        st.error("❌ Could not generate audio response")

def continuous_voice_mode():
    """Component for continuous voice conversation mode"""
    
    st.subheader("📞 Continuous Voice Mode")
    
    # Initialize continuous mode state
    if 'continuous_mode' not in st.session_state:
        st.session_state.continuous_mode = False
    
    if 'voice_session_active' not in st.session_state:
        st.session_state.voice_session_active = False
    
    # Controls
    col1, col2 = st.columns([1, 1])
    
    with col1:
        if st.button("📞 Start Voice Session", key="start_voice_session", 
                    disabled=st.session_state.voice_session_active):
            st.session_state.voice_session_active = True
            st.session_state.continuous_mode = True
            st.rerun()
    
    with col2:
        if st.button("📴 End Voice Session", key="end_voice_session",
                    disabled=not st.session_state.voice_session_active):
            st.session_state.voice_session_active = False
            st.session_state.continuous_mode = False
            st.rerun()
    
    # Session status
    if st.session_state.voice_session_active:
        st.success("🟢 Voice session active - Speak naturally!")
        
        # Auto-refresh for continuous listening
        if st.session_state.continuous_mode:
            # This would need WebRTC or similar for real continuous audio
            st.info("🎤 Continuous listening mode (demo - click 'Record Voice' to simulate)")
            
            if st.button("🎙️ Record Voice Input", key="continuous_record"):
                # Simulate continuous recording
                voice_text = voice_input_component()
                if voice_text:
                    return voice_text
    else:
        st.info("📴 Voice session inactive")
    
    return None

# Voice settings component
def voice_settings_component():
    """Component for voice-related settings"""
    
    st.subheader("⚙️ Voice Settings")
    
    # Audio quality settings
    audio_quality = st.selectbox(
        "Audio Quality:",
        ["Standard", "High", "Low"],
        index=0
    )
    
    # Speech rate
    speech_rate = st.slider(
        "Speech Rate:",
        min_value=0.5,
        max_value=2.0,
        value=1.0,
        step=0.1
    )
    
    # Voice gender (if available)
    voice_type = st.selectbox(
        "Voice Type:",
        ["Default", "Male", "Female"],
        index=0
    )
    
    # Microphone sensitivity
    mic_sensitivity = st.slider(
        "Microphone Sensitivity:",
        min_value=0.1,
        max_value=2.0,
        value=1.0,
        step=0.1
    )
    
    # Save settings
    voice_settings = {
        'audio_quality': audio_quality,
        'speech_rate': speech_rate,
        'voice_type': voice_type,
        'mic_sensitivity': mic_sensitivity
    }
    
    st.session_state.voice_settings = voice_settings
    
    return voice_settings

# Demo function for testing voice features
def voice_demo():
    """Demo page for testing voice features"""
    
    st.title("🎤 Voice Features Demo")
    
    # Language selection
    language = st.selectbox(
        "Select Language:",
        ["en", "hi", "gu", "mr", "bn", "ml", "ur"],
        format_func=lambda x: {
            'en': 'English',
            'hi': 'Hindi',
            'gu': 'Gujarati', 
            'mr': 'Marathi',
            'bn': 'Bengali',
            'ml': 'Malayalam',
            'ur': 'Urdu'
        }[x]
    )
    
    # Voice input demo
    st.header("🎤 Voice Input Demo")
    voice_text = voice_input_component(language)
    
    if voice_text:
        st.write(f"**Voice Input Received:** {voice_text}")
    
    # Voice output demo
    st.header("🔊 Voice Output Demo")
    test_text = st.text_area(
        "Enter text to convert to speech:",
        value="Hello, this is a test of the text-to-speech feature."
    )
    
    if st.button("🗣️ Generate Speech"):
        audio_response_component(test_text, language)
    
    # Continuous mode demo
    st.header("📞 Continuous Voice Mode")
    continuous_input = continuous_voice_mode()
    
    if continuous_input:
        st.write(f"**Continuous Input:** {continuous_input}")
    
    # Voice settings
    st.header("⚙️ Voice Settings")
    voice_settings_component()

if __name__ == "__main__":
    voice_demo()