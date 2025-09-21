import { useState, useRef, useCallback, useEffect } from 'react';
import { voiceAssistantAPI, audioProcessor, VoiceAssistantAPI, AudioProcessor } from '@/services/voiceApi';

export interface ConversationMessage {
  type: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: Date;
  audio?: string; // base64 audio for playback
  emergencyLevel?: string;
  requiresHospital?: boolean;
}

export interface VoiceSessionState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  currentLanguage: string;
  sessionId: string | null;
  conversation: ConversationMessage[];
  error: string | null;
}

export const useRealtimeVoice = () => {
  const [state, setState] = useState<VoiceSessionState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    currentLanguage: 'en',
    sessionId: null,
    conversation: [],
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Connect to voice assistant
  const connect = useCallback(async (language: string = 'en') => {
    try {
      setState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      const sessionId = generateSessionId();
      await voiceAssistantAPI.connectWebSocket(sessionId);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        sessionId,
        currentLanguage: language,
        isProcessing: false,
      }));

      // Setup event handlers
      voiceAssistantAPI.onSessionStarted((data) => {
        console.log('Session started:', data);
        if (data.greeting) {
          setState(prev => ({
            ...prev,
            conversation: [
              ...prev.conversation,
              {
                type: 'assistant',
                message: data.greeting,
                timestamp: new Date(),
              }
            ]
          }));
        }
      });

      voiceAssistantAPI.onConversationResponse((data) => {
        console.log('Conversation response:', data);
        
        // Add user transcription if available
        if (data.transcription) {
          setState(prev => ({
            ...prev,
            conversation: [
              ...prev.conversation,
              {
                type: 'user',
                message: data.transcription,
                timestamp: new Date(),
              }
            ]
          }));
        }

        // Add AI response
        if (data.ai_response) {
          setState(prev => ({
            ...prev,
            conversation: [
              ...prev.conversation,
              {
                type: 'assistant',
                message: data.ai_response,
                timestamp: new Date(),
                audio: data.audio_response,
                emergencyLevel: data.emergency_level,
                requiresHospital: data.requires_hospital,
              }
            ]
          }));
        }

        setState(prev => ({ ...prev, isProcessing: false }));
      });

      voiceAssistantAPI.onAudioResponse((data) => {
        console.log('Audio response received:', data);
        if (data.audio) {
          playAudioResponse(data.audio);
        }
      });

      voiceAssistantAPI.onError((data) => {
        console.error('Voice assistant error:', data);
        setState(prev => ({
          ...prev,
          error: data.error || 'An error occurred',
          isProcessing: false,
          isListening: false,
        }));
      });

      // Start the voice session
      voiceAssistantAPI.startRealtimeVoiceSession(language);

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to voice assistant',
        isProcessing: false,
      }));
    }
  }, [generateSessionId]);

  // Disconnect from voice assistant
  const disconnect = useCallback(() => {
    if (state.isListening) {
      stopListening();
    }
    
    voiceAssistantAPI.endRealtimeVoiceSession();
    voiceAssistantAPI.disconnectWebSocket();
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      sessionId: null,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
    }));
  }, [state.isListening]);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (!state.isConnected || state.isListening) return;

    try {
      setState(prev => ({ ...prev, isListening: true, error: null }));
      
      initializeAudioContext();
      await audioProcessor.startRecording();

      // Send audio chunks periodically
      recordingIntervalRef.current = setInterval(async () => {
        try {
          // We'll need to modify audioProcessor to support chunk streaming
          // For now, we'll use a simplified approach
        } catch (error) {
          console.error('Error sending audio chunk:', error);
        }
      }, 500); // Send chunks every 500ms

    } catch (error) {
      console.error('Failed to start listening:', error);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: 'Failed to start listening. Please check microphone permissions.',
      }));
    }
  }, [state.isConnected, state.isListening, initializeAudioContext]);

  // Stop listening for voice input
  const stopListening = useCallback(async () => {
    if (!state.isListening) return;

    try {
      setState(prev => ({ ...prev, isListening: false, isProcessing: true }));

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      const audioBlob = await audioProcessor.stopRecording();
      const base64Audio = await audioProcessor.audioToBase64(audioBlob);
      
      // Send the complete audio to the backend
      voiceAssistantAPI.sendAudioChunk(base64Audio);

    } catch (error) {
      console.error('Failed to stop listening:', error);
      setState(prev => ({
        ...prev,
        isListening: false,
        isProcessing: false,
        error: 'Failed to process audio',
      }));
    }
  }, [state.isListening]);

  // Play audio response
  const playAudioResponse = useCallback((base64Audio: string) => {
    try {
      setState(prev => ({ ...prev, isSpeaking: true }));
      
      const audioUrl = audioProcessor.base64ToAudioUrl(base64Audio);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audioPlayerRef.current.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audioPlayerRef.current.play();
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Send text message
  const sendTextMessage = useCallback(async (message: string) => {
    if (!state.isConnected) return;

    try {
      setState(prev => ({
        ...prev,
        conversation: [
          ...prev.conversation,
          {
            type: 'user',
            message,
            timestamp: new Date(),
          }
        ],
        isProcessing: true,
      }));

      const response = await voiceAssistantAPI.chatWithText({
        message,
        language: state.currentLanguage,
        session_id: state.sessionId || undefined,
      });

      setState(prev => ({
        ...prev,
        conversation: [
          ...prev.conversation,
          {
            type: 'assistant',
            message: response.response,
            timestamp: new Date(),
            emergencyLevel: response.emergency_level,
            requiresHospital: response.requires_hospital,
          }
        ],
        isProcessing: false,
      }));

      // Generate and play audio response
      const audioBlob = await voiceAssistantAPI.generateSpeech(response.response, state.currentLanguage);
      const base64Audio = await audioProcessor.audioToBase64(audioBlob);
      playAudioResponse(base64Audio);

    } catch (error) {
      console.error('Failed to send text message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
        isProcessing: false,
      }));
    }
  }, [state.isConnected, state.currentLanguage, state.sessionId, playAudioResponse]);

  // Change language
  const changeLanguage = useCallback(async (language: string) => {
    if (state.currentLanguage === language) return;

    setState(prev => ({ ...prev, currentLanguage: language }));

    if (state.isConnected) {
      // Restart session with new language
      disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cleanup
      await connect(language);
    }
  }, [state.currentLanguage, state.isConnected, disconnect, connect]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState(prev => ({ ...prev, conversation: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        disconnect();
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendTextMessage,
    changeLanguage,
    clearConversation,
    playAudioResponse,
  };
};