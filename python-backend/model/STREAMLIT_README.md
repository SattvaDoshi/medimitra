# AI Health Agent - Streamlit App

A comprehensive Streamlit web application for the AI Health Agent with voice interaction capabilities, hospital coordination, and multi-language support.

## 🌟 Features

### 🤖 AI Health Assistant
- **Intelligent Symptom Analysis**: Advanced AI-powered health guidance using Google Gemini
- **4-Level Triage System**: Home care, monitoring, hospital consultation, and emergency classifications
- **Personalized Responses**: Context-aware conversations with medical disclaimers

### 🎤 Voice Interaction
- **Speech-to-Text**: Convert voice input to text in multiple languages
- **Text-to-Speech**: AI responses with natural voice synthesis
- **Continuous Voice Mode**: Phone call-like continuous conversation
- **Multi-language Voice Support**: English, Hindi, Gujarati, Marathi, Bengali, Malayalam, Urdu

### 🏥 Hospital Coordination
- **Smart Hospital Search**: Location-based hospital recommendations
- **Emergency Services**: Automatic emergency hospital filtering
- **Comprehensive Database**: 50+ hospitals across major Indian cities
- **Contact Information**: Phone numbers, addresses, and specialties

### 🌐 Multi-language Support
- **7 Languages**: English, Hindi, Gujarati, Marathi, Bengali, Malayalam, Urdu
- **Native Script Display**: Proper rendering of regional languages
- **Language-specific Voice**: TTS and STT in user's preferred language

### 💻 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme adaptation
- **Interactive Components**: Tabbed interface, audio players, voice controls
- **Real-time Updates**: Live conversation updates and status indicators

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Google API key for Gemini AI
- Microphone access for voice features

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd python-backend/model
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements_streamlit.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file in the model directory:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run the Streamlit app:**
   ```bash
   streamlit run streamlit_app.py
   ```

5. **Open your browser:**
   The app will automatically open at `http://localhost:8501`

## 📱 Usage Guide

### Basic Text Interaction
1. Enter your city in the sidebar for hospital recommendations
2. Select your preferred language
3. Type your health concerns in the "Text Input" tab
4. Click "Send Message" to get AI response
5. Enable audio to hear responses spoken aloud

### Voice Interaction
1. Go to the "Voice Input" tab
2. Click "Start Recording" to capture your voice
3. Speak your symptoms or questions
4. The AI will transcribe and respond with both text and voice

### Continuous Voice Mode
1. Navigate to the "Continuous Voice" tab
2. Click "Start Voice Session" for phone call-like interaction
3. Speak naturally without button presses
4. End session when done

### Hospital Search
1. Enter your location in the sidebar
2. Use the "Hospital Search" panel on the right
3. Check "Emergency services required" for urgent cases
4. Click "Find Hospitals" to get recommendations

## 🔧 Configuration

### Voice Settings
- **Audio Quality**: Standard, High, Low
- **Speech Rate**: 0.5x to 2.0x speed
- **Voice Type**: Default, Male, Female (where available)
- **Microphone Sensitivity**: Adjustable input levels

### Language Settings
- **UI Language**: Interface language selection
- **Voice Language**: TTS/STT language matching
- **Regional Variants**: Country-specific language variants

## 🏗️ Architecture

### Core Components
- `streamlit_app.py`: Main application interface
- `voice_components.py`: Voice processing and audio handling
- `hospital_data.py`: Hospital database and search functions
- `main.py`: Original AI agent logic and prompts

### Key Classes
- **VoiceProcessor**: Handles speech recognition and recording
- **AudioPlayer**: Manages text-to-speech and audio playback
- **AI Response System**: Gemini API integration and context management

## 🛡️ Safety & Disclaimers

### Medical Disclaimer
This application is for **informational purposes only** and is **not a substitute for professional medical advice**, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.

### Privacy & Data
- **No Data Storage**: Conversations are session-based only
- **Local Processing**: Voice processing happens locally when possible
- **API Calls**: Only necessary data sent to Google APIs
- **No Medical Records**: No personal health information is stored

## 🌍 Supported Regions

### Hospital Coverage
- **Mumbai**: 15+ hospitals including emergency services
- **Delhi**: 12+ hospitals with specialties
- **Bangalore**: 10+ hospitals including tech belt areas
- **Chennai**: 8+ hospitals with comprehensive services
- **Kolkata**: 6+ hospitals including emergency care
- **Hyderabad**: 8+ hospitals with specialization info
- **Pune**: 6+ hospitals covering metro areas
- **Ahmedabad**: 5+ hospitals with emergency services

### Language Coverage
- **English**: Global standard
- **Hindi**: National language (India)
- **Regional**: Gujarati, Marathi, Bengali, Malayalam, Urdu
- **Voice Support**: TTS/STT available for all languages

## 🔧 Troubleshooting

### Common Issues

**Microphone not working:**
- Check browser permissions for microphone access
- Ensure PyAudio is properly installed
- Try the "Test Microphone" button

**Audio playback issues:**
- Check browser audio permissions
- Verify internet connection for TTS
- Try different audio quality settings

**API errors:**
- Verify Google API key in .env file
- Check API quota and billing
- Ensure Gemini API is enabled

**Language issues:**
- Install language-specific TTS voices
- Check regional language support
- Verify speech recognition language codes

### Installation Issues

**PyAudio installation (Windows):**
```bash
pip install pipwin
pipwin install pyaudio
```

**PyAudio installation (macOS):**
```bash
brew install portaudio
pip install pyaudio
```

**PyAudio installation (Linux):**
```bash
sudo apt-get install python3-pyaudio
```

## 📈 Performance Tips

### Optimization
- **Voice Quality**: Use "Standard" for faster processing
- **Session Management**: Clear conversation history for better performance
- **Network**: Stable internet required for AI responses and TTS
- **Browser**: Use Chrome/Firefox for best WebRTC support

### Resource Usage
- **Memory**: ~100-200MB typical usage
- **CPU**: Higher during voice processing
- **Network**: ~1-5MB per AI response
- **Storage**: Temporary audio files only

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install development dependencies
4. Make changes and test thoroughly
5. Submit a pull request

### Testing
```bash
# Run basic tests
python -m pytest tests/

# Test voice components
python voice_components.py

# Test hospital search
python test_agent.py
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the troubleshooting guide
- Review the API documentation

---

**Built with ❤️ for Healthcare Innovation**

*Empowering accessible healthcare through AI and voice technology*