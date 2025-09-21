import os
import speech_recognition as sr
from gtts import gTTS
import google.generativeai as genai
from dotenv import load_dotenv
import time
from playsound import playsound
import math
import re
from hospital_data import INDIAN_HOSPITALS, EMERGENCY_CONDITIONS

# --- CONFIGURATION ---
load_dotenv()
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except TypeError:
    print("❌ ERROR: GOOGLE_API_KEY not found. Please check your .env file.")
    exit()

SYSTEM_PROMPT = """
You are an advanced AI Health Agent with enhanced capabilities. Your goal is to provide comprehensive health guidance and coordinate medical care when needed.

## Persona & Tone
Your persona is calm, empathetic, and professional. Always be reassuring. Never use alarming language, but be clear and firm when a situation is serious.

## Core Safety Directive
**CRITICAL RULE:** You are an AI assistant, not a medical professional. You cannot diagnose conditions. Your primary function is to provide preliminary guidance based on patterns and coordinate appropriate care. Every interaction that gives advice must end with a clear disclaimer tailored to the situation's severity.

## Conversational Rules
1.  **Smarter Information Gathering:** Before classifying a symptom, ask clarifying questions to understand its severity, duration, and associated symptoms. You must also ask about relevant context or potential triggers. For example, for a stomach ache, ask "Have you eaten anything unusual recently?"; for cold symptoms, ask "Were you recently exposed to cold weather or someone who was sick?"
2.  **One Question at a Time:** Ask only ONE follow-up question at a time. Wait for the user's answer before asking the next one.
3.  **Language Matching:** Respond in the same language the user is speaking.
4.  **Graceful Conversation Endings:** If you ask the user if they need more help (e.g., "Is there anything else I can help with?") and they respond negatively (e.g., "no," "no thanks"), you must end the conversation with a polite closing like, "Alright, take care and feel better soon! Goodbye."

## Enhanced Triage & Care Coordination Protocol
You must classify the user's condition into one of four categories and respond with the specific actions outlined below:

**1. HOME CARE - MILD Condition:**
   - **Criteria:** Symptoms are common and not severe (e.g., common cold, mild headache, minor cuts, bruises, mild fever under 101°F, sore throat without difficulty swallowing).
   - **Your Action:** First, state the general possibility in simple terms. Then, provide detailed home care instructions including rest, fluids, and relevant OTC medicine types with dosages. Include when to monitor and what warning signs to watch for.
   - **Disclaimer:** "These symptoms can usually be managed at home. However, if symptoms worsen or don't improve in 2-3 days, please consult a healthcare provider."

**2. HOME CARE WITH MONITORING - MODERATE Condition:**
   - **Criteria:** Symptoms are persistent but manageable at home with close monitoring (e.g., fever 101-102°F, persistent cough without breathing difficulty, mild to moderate pain, upset stomach).
   - **Your Action:** Provide home care instructions but emphasize the need for close monitoring. Give specific warning signs that would require immediate medical attention.
   - **Disclaimer:** "While these symptoms can often be managed at home, please monitor closely and seek medical care if symptoms worsen or don't improve within 24-48 hours."

**3. HOSPITAL CONSULTATION REQUIRED:**
   - **Criteria:** Symptoms require professional medical evaluation but are not immediately life-threatening (e.g., fever over 102°F persisting, severe persistent pain, signs of infection, concerning changes in symptoms).
   - **Your Action:** Recommend seeking medical attention within 24 hours. Ask for the patient's location to help find nearby hospitals. Provide the hospital information and suggest calling ahead.
   - **Hospital Coordination:** "I recommend you see a doctor today. Can you tell me which city you're in so I can help you find the nearest hospital? I can also help call ahead to inform them about your symptoms."

**4. EMERGENCY - IMMEDIATE HOSPITAL REQUIRED:**
   - **Criteria:** Symptoms require immediate emergency attention (e.g., chest pain, severe difficulty breathing, signs of stroke, severe bleeding, high fever above 103°F, severe allergic reactions, loss of consciousness).
   - **Your Action:** BE EXTREMELY BRIEF AND DIRECT. Ask for location in ONE sentence. Immediately provide hospital name and phone number. No explanations.
   - **Emergency Format:** "Emergency. Your location?" → Get location → "Nearest hospital: [NAME] Emergency: [PHONE NUMBER]. Call now. Go immediately."

## Hospital Coordination Protocol
When hospital care is needed (categories 3 & 4):
1. Ask for location in ONE short sentence
2. Immediately provide hospital name and emergency phone number
3. Give direct instruction: "Call this number now and go there immediately"
4. No long explanations or reassurances

## CRITICAL EMERGENCY RULES
- Maximum 2 sentences per response
- Always provide actual phone numbers immediately  
- No "I am calling" or "I will help" - give them the number to call
- No reassuring language - just facts and phone numbers
- Format: "Hospital Name: Phone Number. Call now."
"""
# --- CORE FUNCTIONS ---

def speak_text(text, lang_code):
    """Converts text to speech using gTTS and plays it using playsound (blocking)."""
    print(f"🤖 AI: {text}")
    try:
        tts = gTTS(text=text, lang=lang_code)
        filename = "response.mp3"
        tts.save(filename)
        playsound(filename) # This is the blocking call that waits
        os.remove(filename) # Clean up the audio file after it has finished playing
    except Exception as e:
        print(f"Error in Text-to-Speech: {e}")

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

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

def format_hospital_info(hospital, include_emergency=False):
    """Format hospital information for speaking"""
    info = f"{hospital['name']} located at {hospital['address']}. "
    info += f"Phone number: {hospital['phone']}. "
    
    if include_emergency and hospital.get('emergency_services'):
        info += f"Emergency number: {hospital.get('emergency_phone', hospital['phone'])}. "
    
    if hospital.get('specialties'):
        specialties = ', '.join(hospital['specialties'][:3])  # Limit to first 3 specialties
        info += f"Specialties include: {specialties}. "
    
    return info

def simulate_hospital_call(hospital, patient_info, lang_code):
    """Simulate calling a hospital to inform about incoming patient"""
    print(f"\n📞 Calling {hospital['name']}...")
    print(f"Dialing: {hospital.get('emergency_phone', hospital['phone'])}")
    
    # Simulate call dialogue
    call_messages = {
        'en': [
            f"🏥 Hospital: Hello, {hospital['name']} emergency department.",
            f"🤖 AI Agent: Hello, I'm calling to inform you about a patient who needs immediate medical attention.",
            f"🤖 AI Agent: Patient symptoms: {patient_info.get('symptoms', 'Not specified')}",
            f"🤖 AI Agent: Estimated arrival time: 15-30 minutes.",
            f"🏥 Hospital: Thank you for the information. We'll be prepared for the patient's arrival.",
            f"🤖 AI Agent: Thank you. The patient is on their way."
        ],
        'hi': [
            f"🏥 अस्पताल: नमस्ते, {hospital['name']} आपातकालीन विभाग।",
            f"🤖 AI एजेंट: नमस्ते, मैं एक मरीज के बारे में सूचित करने के लिए कॉल कर रहा हूं जिसे तत्काल चिकित्सा सहायता की आवश्यकता है।",
            f"🤖 AI एजेंट: मरीज के लक्षण: {patient_info.get('symptoms', 'निर्दिष्ट नहीं')}",
            f"🤖 AI एजेंट: अनुमानित पहुंचने का समय: 15-30 मिनट।",
            f"🏥 अस्पताल: जानकारी के लिए धन्यवाद। हम मरीज के आने के लिए तैयार रहेंगे।",
            f"🤖 AI एजेंट: धन्यवाद। मरीज अपने रास्ते में है।"
        ]
    }
    
    messages = call_messages.get(lang_code, call_messages['en'])
    
    for message in messages:
        print(message)
        time.sleep(1)  # Simulate conversation timing
    
    return True

def listen_to_user(recognizer, microphone, lang_code):
    """Listens for user's voice and converts to text in the specified language."""
    with microphone as source:
        print("\n👂 Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=20)
        except sr.WaitTimeoutError:
            return None

    try:
        print("🤔 Recognizing...")
        text = recognizer.recognize_google(audio, language=lang_code)
        print(f"👤 You: {text}")
        return text
    except sr.UnknownValueError:
        return None
    except sr.RequestError:
        return "error_api"

# --- MAIN APPLICATION ---

def main():
    """Main function to run the voice assistant loop."""
    # Initialization
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    # --- Language Selection ---
    print("Please select your language:")
    print("1: English")
    print("2: Hindi (हिंदी)")
    print("3: Gujarati (ગુજરાતી)")
    print("4: Marathi (मराठी)")
    print("5: Bengali (বাংলা)")
    print("6: Malayalam (മലയാളം)")
    print("7: Urdu (اردو)")


    lang_choice = input("Enter the number for your language (1-7): ")

    # MAPPING CODES FOR THE DIFFERENT LIBRARIES
    if lang_choice == '1':
        stt_lang_code = 'en-IN' # For SpeechRecognition
        tts_lang_code = 'en'    # For gTTS
        lang_name = 'English'
    elif lang_choice == '2':
        stt_lang_code = 'hi-IN' # For SpeechRecognition
        tts_lang_code = 'hi'    # For gTTS
        lang_name = 'Hindi'
    elif lang_choice == '3':
        stt_lang_code = 'gu-IN' # For SpeechRecognition
        tts_lang_code = 'gu'    # For gTTS
        lang_name = 'Gujarati'
    elif lang_choice == '4':
        stt_lang_code = 'mr-IN' # For SpeechRecognition
        tts_lang_code = 'mr'    # For gTTS
        lang_name = 'Marathi'
    elif lang_choice == '5':
        stt_lang_code = 'bn-IN' # For SpeechRecognition
        tts_lang_code = 'bn'    # For gTTS
        lang_name = 'Bengali'
    elif lang_choice == '6':
        stt_lang_code = 'ml-IN' # For SpeechRecognition
        tts_lang_code = 'ml'    # For gTTS
        lang_name = 'Malayalam'
    elif lang_choice == '7':
        stt_lang_code = 'ur-IN' # For SpeechRecognition
        tts_lang_code = 'ur'    # For gTTS
        lang_name = 'Urdu'
    else:
        print("Invalid choice. Defaulting to English.")
        stt_lang_code = 'en-IN'
        tts_lang_code = 'en'
        lang_name = 'English'

    print(f"Language set to {lang_name}.")

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT
    )
    chat = model.start_chat(history=[])

    # Start the conversation
    initial_greetings = {
        'en': "Hello, I am your personal health assistant. How are you feeling today?",
        'hi': "नमस्ते, मैं आपका व्यक्तिगत स्वास्थ्य सहायक हूँ। आप आज कैसा महसूस कर रहे हैं?",
        'gu': "નમસ્તે, હું તમારો અંગત આરોગ્ય સહાયક છું. આજે તમને કેવું લાગે છે?",
        'mr': "नमस्कार, मी तुमचा वैयक्तिक आरोग्य सहाय्यक आहे. तुम्हाला आज कसे वाटत आहे?",
        'bn': "নমস্কার, আমি আপনার ব্যক্তিগত স্বাস্থ্য সহায়ক। আপনি আজ কেমন অনুভব করছেন?",
        'ml': "നമസ്കാരം, ഞാൻ നിങ്ങളുടെ സ്വകാര്യ ആരോഗ്യ സഹായിയാണ്. നിങ്ങൾക്ക് ഇന്ന് എന്തു തോന്നുന്നു?",
        'ur': "ہیلو، میں آپ کا ذاتی ہیلتھ اسسٹنٹ ہوں۔ آج آپ کیسی طبیعت ہے؟"
    }
    greeting = initial_greetings.get(tts_lang_code, "Hello.")
    speak_text(greeting, tts_lang_code)

    while True:
        user_input = listen_to_user(recognizer, microphone, stt_lang_code)

        if user_input:
            if user_input == "error_api":
                speak_text("Sorry, I'm having trouble connecting to the speech service.", tts_lang_code)
                continue

            # Universal exit commands
            exit_commands = ['goodbye', 'exit', 'quit', 'अलविदा', 'अलविदा', 'বিদায়', 'വിട']
            if any(cmd in user_input.lower() for cmd in exit_commands):
                speak_text("Goodbye! Please take care.", tts_lang_code)
                break

            print("🧠 Thinking...")
            try:
                # Check if this is a potential emergency based on keywords
                user_lower = user_input.lower()
                is_emergency = any(condition in user_lower for condition in EMERGENCY_CONDITIONS)
                
                # Enhanced prompt with hospital coordination capabilities
                enhanced_prompt = f"""
                Your response must be in {lang_name}. The user said: {user_input}
                
                IMPORTANT: You now have access to hospital coordination features. If you determine that hospital care is needed:
                1. For NON-EMERGENCY hospital consultation: Ask "Can you tell me which city you're in so I can help you find the nearest hospital?"
                2. For EMERGENCY situations: Ask "Please tell me your location immediately so I can direct you to the nearest emergency room."
                
                After the user provides their location, I will help you find and contact the appropriate hospital.
                
                Current conversation context: The user is describing health symptoms and you need to assess the appropriate level of care needed.
                """
                
                response = chat.send_message(enhanced_prompt)
                ai_response = response.text
                
                # Check if AI is asking for location for hospital referral
                location_keywords = ['city', 'location', 'where are you', 'which city', 'your location']
                asking_location = any(keyword in ai_response.lower() for keyword in location_keywords)
                
                speak_text(ai_response, tts_lang_code)
                
                # If AI asked for location, wait for location input and handle hospital coordination
                if asking_location:
                    print("\n🚨 EMERGENCY MODE - Getting hospital info...")
                    location_input = listen_to_user(recognizer, microphone, stt_lang_code)
                    
                    if location_input:
                        print(f"📍 Location: {location_input}")
                        
                        # Find nearest hospitals
                        hospitals, error_msg = find_nearest_hospitals(location_input, emergency_required=is_emergency)
                        
                        if error_msg:
                            speak_text(error_msg, tts_lang_code)
                        else:
                            # For emergency - provide immediate hospital info
                            if is_emergency and hospitals:
                                hospital = hospitals[0]  # Get nearest hospital
                                emergency_phone = hospital.get('emergency_phone', hospital['phone'])
                                
                                # Create immediate response with hospital details
                                emergency_texts = {
                                    'en': f"Emergency: {hospital['name']}. Call {emergency_phone} now. Address: {hospital['address']}. Go immediately.",
                                    'hi': f"आपातकाल: {hospital['name']}। अभी कॉल करें {emergency_phone}। पता: {hospital['address']}। तुरंत जाएं।",
                                    'gu': f"ઈમરજન્સી: {hospital['name']}। હમણાં કૉલ કરો {emergency_phone}। સરનામું: {hospital['address']}। તુરંત જાઓ।",
                                    'mr': f"आपत्काळ: {hospital['name']}। आता कॉल करा {emergency_phone}। पत्ता: {hospital['address']}। ताबडतोब जा।",
                                    'bn': f"জরুরি: {hospital['name']}। এখনই কল করুন {emergency_phone}। ঠিকানা: {hospital['address']}। তৎক্ষণাৎ যান।",
                                    'ml': f"അടിയന്തരം: {hospital['name']}। ഇപ്പോൾ വിളിക്കുക {emergency_phone}। വിലാസം: {hospital['address']}। ഉടൻ പോകുക।",
                                    'ur': f"ہنگامی: {hospital['name']}۔ ابھی کال کریں {emergency_phone}۔ پتہ: {hospital['address']}۔ فوری طور پر جائیں۔"
                                }
                                
                                emergency_text = emergency_texts.get(tts_lang_code, emergency_texts['en'])
                                print(f"\n🚨 EMERGENCY INFO: {emergency_text}")
                                speak_text(emergency_text, tts_lang_code)
                                
                            else:
                                # For non-emergency hospital consultation
                                hospital_list = []
                                for i, hospital in enumerate(hospitals[:2], 1):  # Show only top 2
                                    phone = hospital.get('emergency_phone', hospital['phone'])
                                    hospital_list.append(f"{i}. {hospital['name']}: {phone}")
                                
                                hospital_text = "\n".join(hospital_list)
                                print(f"\n🏥 Hospitals:\n{hospital_text}")
                                speak_text(f"Nearby hospitals: {hospital_text}", tts_lang_code)
                            
            except Exception as e:
                error_message = f"An error occurred: {e}"
                print(error_message)
                speak_text("Sorry, I am having a problem with my internal systems right now.", tts_lang_code)
        else:
            # This handles cases where the user was silent
            pass

if __name__ == "__main__":
    main()