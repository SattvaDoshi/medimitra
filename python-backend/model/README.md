# AI Voice-Based Health Agent with Hospital Coordination

This is an advanced Python application that acts as a conversational AI Health Agent. It not only helps users identify potential causes for their health symptoms but also provides intelligent care coordination by:

- **Smart Treatment Assessment**: Determines if symptoms can be treated at home or require hospital care
- **Hospital Location Services**: Finds nearby hospitals based on patient location in major Indian cities
- **Emergency Coordination**: Automatically calls hospitals for emergency cases to inform them about incoming patients
- **Multi-language Support**: Supports English, Hindi, Gujarati, Marathi, Bengali, Malayalam, and Urdu

The AI agent uses speech-to-text, the Gemini API for intelligent decision making, and text-to-speech for complete voice-based interaction.

## ⚠️ Disclaimer
This tool is for informational purposes only and is **not a substitute for professional medical advice**, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.

## 🏥 New AI Agent Features

### Intelligent Care Assessment
The AI now categorizes health conditions into four levels:
1. **Home Care - Mild**: Common conditions manageable at home
2. **Home Care with Monitoring**: Conditions requiring close observation
3. **Hospital Consultation Required**: Non-emergency hospital visit needed
4. **Emergency**: Immediate hospital care required

### Hospital Database
Comprehensive database of hospitals across major Indian cities:
- Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad
- Each hospital entry includes: name, address, phone numbers, specialties, emergency services
- Automatic selection of hospitals with emergency services for urgent cases

### Location-Based Services
- Asks for patient location when hospital care is needed
- Finds nearest appropriate hospitals based on condition severity
- Provides complete hospital information including contact details

### Emergency Coordination
- For emergency cases: automatically offers to call hospital emergency departments
- Simulates hospital communication to alert them about incoming patients
- Provides estimated arrival times and symptom information to hospitals

## Setup

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd ai-voice-assistant-main
    ```

2.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *Note: If `pyaudio` installation fails, you may need to install its system dependency, PortAudio.*

4.  **Set Up API Key:**
    -   Create a file named `.env` in the project root.
    -   Add your Google Gemini API key to it:
        `GOOGLE_API_KEY="YOUR_API_KEY_HERE"`

## How to Run

Execute the main script from your terminal:
```bash
python main.py
```

## How It Works

1. **Language Selection**: Choose your preferred language for interaction
2. **Symptom Description**: Describe your health concerns in natural language
3. **AI Assessment**: The AI analyzes symptoms and determines appropriate care level
4. **Care Coordination**: 
   - For home care: Provides detailed home treatment instructions
   - For hospital care: Asks for location and finds nearest hospitals
   - For emergencies: Offers to contact hospital emergency departments
5. **Hospital Information**: Provides complete hospital details including directions and contact numbers

## Example Scenarios

### Home Care Example
**User**: "I have a mild headache and runny nose"
**AI**: Provides home remedies, rest advice, and monitoring instructions

### Hospital Consultation Example  
**User**: "I've had a high fever for 3 days and severe body aches"
**AI**: Recommends hospital consultation, asks for location, provides nearest hospital information

### Emergency Example
**User**: "I'm having severe chest pain and difficulty breathing"
**AI**: Immediately requests location, provides nearest emergency hospital, offers to call ahead

## Supported Cities

The AI agent has hospital data for these major Indian cities:
- **Mumbai** (4 hospitals including Kokilaben, Lilavati, Hinduja)
- **Delhi** (4 hospitals including AIIMS, Fortis, Max, Apollo)
- **Bangalore** (4 hospitals including Manipal, Apollo, Fortis, Narayana)
- **Chennai** (3 hospitals including Apollo, Fortis Malar, MIOT)
- **Hyderabad** (2 hospitals including Apollo Health City, Care)
- **Pune** (2 hospitals including Ruby Hall, Jehangir)
- **Ahmedabad** (2 hospitals including Apollo, Zydus)
- **Kolkata** (2 hospitals including Apollo Gleneagles, Fortis)

## Key Features

✅ **Voice-based interaction** in 7 Indian languages  
✅ **Intelligent symptom assessment** with 4-tier care classification  
✅ **Location-aware hospital search** across major Indian cities  
✅ **Emergency coordination** with automatic hospital calling  
✅ **Comprehensive hospital database** with 25+ hospitals  
✅ **Multi-language emergency communication**  
✅ **Real-time care guidance** from home remedies to emergency protocols