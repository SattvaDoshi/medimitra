import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    welcomeSubtitle: 'Rural Healthcare at Your Fingertips',
    chooseLanguage: 'Choose Your Language',
    farmerMode: 'Farmer Mode',
    enableFarmerMode: 'Enable Farmer Mode',
    farmerModeDescription: 'Larger icons and simplified interface for rural users',
    feature1: 'Telemedicine consultations in your language',
    feature2: 'Offline medicine availability and pricing',
    feature3: 'Connect with local ASHA health workers',
    continue: 'Continue',
    home: 'Home',
    consult: 'Consult',
    medicine: 'Medicine',
    community: 'Community',
    more: 'More',
    login: 'Login',
    enterPhone: 'Enter your phone number',
    getOtp: 'Get OTP',
    verifyOtp: 'Verify OTP',
    enterOtp: 'Enter 6-digit OTP',
    verify: 'Verify',
    selectRole: 'Select Your Role',
    patient: 'Patient',
    asha: 'ASHA Worker',
    doctor: 'Doctor',
    dashboard: 'Dashboard',
    bookConsultation: 'Book Consultation',
    medicineAvailability: 'Medicine Availability',
    healthRecords: 'Health Records',
    aiSymptomChecker: 'AI Symptom Checker',
    nearestHospital: 'Nearest Hospital',
    safeRouteFinder: 'Safe Route Finder',
    welcome: 'Welcome',
    totalPatients: 'Total Patients',
    newPatients: 'New Patients',
    followUps: 'Follow Ups',
    upcomingAppointments: 'Upcoming Appointments',
    recentConsultations: 'Recent Consultations',
    viewAll: 'View All',
    searchPatients: 'Search Patients',
    addPatient: 'Add Patient',
    patientDetails: 'Patient Details',
    generalCheckup: 'General Checkup',
    completed: 'Completed',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
    notifications: 'Notifications',
    noNotifications: 'No New Notifications',
    checkBackLater: 'All caught up! Check back later.',
    accountSettings: 'Account and Settings',
    changePassword: 'Change Password',
    enableNotifications: 'Two-Factor Verification',
    deleteAccount: 'Delete Account',
    paymentMethods: 'Payment Methods',
    accessibility: 'Accessibility',
    subscriptionManagement: 'Subscription Management',
    logout: 'Logout',
    back: 'Back',
  },
  hi: {
    welcomeSubtitle: 'ग्रामीण स्वास्थ्य सेवा आपकी उंगलियों पर',
    chooseLanguage: 'अपनी भाषा चुनें',
    farmerMode: 'किसान मोड',
    enableFarmerMode: 'किसान मोड सक्षम करें',
    farmerModeDescription: 'ग्रामीण उपयोगकर्ताओं के लिए बड़े आइकन और सरल इंटरफेस',
    feature1: 'आपकी भाषा में टेलीमेडिसिन परामर्श',
    feature2: 'ऑफलाइन दवा उपलब्धता और मूल्य निर्धारण',
    feature3: 'स्थानीय आशा स्वास्थ्य कर्मचारियों से जुड़ें',
    continue: 'जारी रखें',
    home: 'होम',
    consult: 'परामर्श',
    medicine: 'दवा',
    community: 'समुदाय',
    more: 'अधिक',
    login: 'लॉगिन',
    enterPhone: 'अपना फोन नंबर दर्ज करें',
    getOtp: 'ओटीपी प्राप्त करें',
    verifyOtp: 'ओटीपी सत्यापित करें',
    enterOtp: '6-अंकीय ओटीपी दर्ज करें',
    verify: 'सत्यापित करें',
    selectRole: 'अपनी भूमिका चुनें',
    patient: 'रोगी',
    asha: 'आशा कार्यकर्ता',
    doctor: 'डॉक्टर',
    dashboard: 'डैशबोर्ड',
    bookConsultation: 'परामर्श बुक करें',
    medicineAvailability: 'दवा उपलब्धता',
    healthRecords: 'स्वास्थ्य रिकॉर्ड',
    aiSymptomChecker: 'एआई लक्षण जांचकर्ता',
    nearestHospital: 'निकटतम अस्पताल',
    safeRouteFinder: 'सुरक्षित मार्ग खोजक',
    welcome: 'स्वागत है',
    totalPatients: 'कुल रोगी',
    newPatients: 'नए रोगी',
    followUps: 'फॉलो अप',
    upcomingAppointments: 'आगामी अपॉइंटमेंट',
    recentConsultations: 'हाल की परामर्श',
    viewAll: 'सभी देखें',
    searchPatients: 'रोगियों को खोजें',
    addPatient: 'रोगी जोड़ें',
    patientDetails: 'रोगी विवरण',
    generalCheckup: 'सामान्य जांच',
    completed: 'पूर्ण',
    scheduled: 'निर्धारित',
    cancelled: 'रद्द',
    notifications: 'सूचनाएं',
    noNotifications: 'कोई नई सूचना नहीं',
    checkBackLater: 'सब कुछ अप टू डेट! बाद में जांचें।',
    accountSettings: 'खाता और सेटिंग्स',
    changePassword: 'पासवर्ड बदलें',
    enableNotifications: 'दो-कारक सत्यापन',
    deleteAccount: 'खाता हटाएं',
    paymentMethods: 'भुगतान के तरीके',
    accessibility: 'पहुंच',
    subscriptionManagement: 'सदस्यता प्रबंधन',
    logout: 'लॉगआउट',
    back: 'वापस',
  },
  pa: {
    welcomeSubtitle: 'ਪੇਂਡੂ ਸਿਹਤ ਸੇਵਾ ਤੁਹਾਡੀ ਉਂਗਲ \'ਤੇ',
    chooseLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    farmerMode: 'ਕਿਸਾਨ ਮੋਡ',
    enableFarmerMode: 'ਕਿਸਾਨ ਮੋਡ ਸਮਰੱਥ ਕਰੋ',
    farmerModeDescription: 'ਪੇਂਡੂ ਵਰਤੋਂਕਾਰਾਂ ਲਈ ਵੱਡੇ ਆਈਕਨ ਅਤੇ ਸਰਲ ਇੰਟਰਫੇਸ',
    feature1: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਟੈਲੀਮੈਡੀਸਿਨ ਸਲਾਹ',
    feature2: 'ਔਫਲਾਈਨ ਦਵਾਈ ਉਪਲਬਧਤਾ ਅਤੇ ਕੀਮਤ',
    feature3: 'ਸਥਾਨਕ ਆਸ਼ਾ ਸਿਹਤ ਕਰਮਚਾਰੀਆਂ ਨਾਲ ਜੁੜੋ',
    continue: 'ਜਾਰੀ ਰੱਖੋ',
    home: 'ਘਰ',
    consult: 'ਸਲਾਹ',
    medicine: 'ਦਵਾਈ',
    community: 'ਕਮਿਊਨਿਟੀ',
    more: 'ਹੋਰ',
    login: 'ਲਾਗਇਨ',
    enterPhone: 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    getOtp: 'ਓਟੀਪੀ ਪ੍ਰਾਪਤ ਕਰੋ',
    verifyOtp: 'ਓਟੀਪੀ ਤਸਦੀਕ ਕਰੋ',
    enterOtp: '6-ਅੰਕ ਦਾ ਓਟੀਪੀ ਦਾਖਲ ਕਰੋ',
    verify: 'ਤਸਦੀਕ ਕਰੋ',
    selectRole: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
    patient: 'ਮਰੀਜ਼',
    asha: 'ਆਸ਼ਾ ਕਰਮਚਾਰੀ',
    doctor: 'ਡਾਕਟਰ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    bookConsultation: 'ਸਲਾਹ ਬੁੱਕ ਕਰੋ',
    medicineAvailability: 'ਦਵਾਈ ਉਪਲਬਧਤਾ',
    healthRecords: 'ਸਿਹਤ ਰਿਕਾਰਡ',
    aiSymptomChecker: 'ਏਆਈ ਲੱਛਣ ਜਾਂਚਕਰਤਾ',
    nearestHospital: 'ਸਭ ਤੋਂ ਨੇੜੇ ਹਸਪਤਾਲ',
    safeRouteFinder: 'ਸੁਰੱਖਿਅਤ ਰੂਟ ਖੋਜਕ',
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    totalPatients: 'ਕੁੱਲ ਮਰੀਜ਼',
    newPatients: 'ਨਵੇਂ ਮਰੀਜ਼',
    followUps: 'ਫਾਲੋ ਅੱਪ',
    upcomingAppointments: 'ਆਉਣ ਵਾਲੇ ਮੁਲਾਕਾਤ',
    recentConsultations: 'ਹਾਲ ਦੀ ਸਲਾਹ',
    viewAll: 'ਸਭ ਵੇਖੋ',
    searchPatients: 'ਮਰੀਜ਼ਾਂ ਨੂੰ ਖੋਜੋ',
    addPatient: 'ਮਰੀਜ਼ ਸ਼ਾਮਲ ਕਰੋ',
    patientDetails: 'ਮਰੀਜ਼ ਦਾ ਵੇਰਵਾ',
    generalCheckup: 'ਆਮ ਜਾਂਚ',
    completed: 'ਪੂਰਾ',
    scheduled: 'ਨਿਸਚਿਤ',
    cancelled: 'ਰੱਦ',
    notifications: 'ਸੂਚਨਾਵਾਂ',
    noNotifications: 'ਕੋਈ ਨਵੀਂ ਸੂਚਨਾ ਨਹੀਂ',
    checkBackLater: 'ਸਭ ਕੁਝ ਅਪ ਟੂ ਡੇਟ! ਬਾਅਦ ਵਿੱਚ ਜਾਂਚ ਕਰੋ।',
    accountSettings: 'ਖਾਤਾ ਅਤੇ ਸੈਟਿੰਗਾਂ',
    changePassword: 'ਪਾਸਵਰਡ ਬਦਲੋ',
    enableNotifications: 'ਦੋ-ਕਾਰਕ ਤਸਦੀਕੀਕਰਨ',
    deleteAccount: 'ਖਾਤਾ ਮਿਟਾਓ',
    paymentMethods: 'ਭੁਗਤਾਨ ਤਰੀਕੇ',
    accessibility: 'ਪਹੁੰਚ',
    subscriptionManagement: 'ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਪ੍ਰਬੰਧਨ',
    logout: 'ਲਾਗਆਉਟ',
    back: 'ਵਾਪਸ',
  },
};

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};