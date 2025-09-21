import axios from 'axios';

// Python backend voice assistant API
const VOICE_API_BASE_URL = import.meta.env.VITE_VOICE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_VOICE_WS_URL || 'ws://localhost:8000';

// Create axios instance for voice API
const voiceApi = axios.create({
  baseURL: VOICE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API communication
export interface ChatRequest {
  message: string;
  language: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  language: string;
  session_id: string;
  emergency_level?: string;
  requires_hospital?: boolean;
}

export interface HospitalSearchRequest {
  city: string;
  emergency_required?: boolean;
  max_results?: number;
}

export interface HospitalSearchResponse {
  hospitals: Array<{
    name: string;
    address: string;
    phone: string;
    distance?: number;
    specialties?: string[];
    emergency_available?: boolean;
  }>;
  total_count: number;
}

export interface LanguageSelection {
  language: string;
}

export interface SessionResponse {
  session_id: string;
  language: string;
  greeting: string;
}

export interface VoiceMessage {
  type: 'start' | 'audio' | 'end' | 'status';
  data?: string; // base64 encoded audio
  language?: string;
}

export interface VoiceResponse {
  type: 'session_started' | 'audio_processed' | 'conversation_response' | 'audio_response' | 'session_ended' | 'error';
  data: {
    transcription?: string;
    ai_response?: string;
    audio_response?: string;
    emergency_level?: string;
    requires_hospital?: boolean;
    audio?: string; // base64 encoded audio
    text?: string;
    language?: string;
    error?: string;
  };
}

// Voice Assistant API Class
export class VoiceAssistantAPI {
  private wsConnection: WebSocket | null = null;
  private sessionId: string | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  // Traditional REST API methods
  async chatWithText(request: ChatRequest): Promise<ChatResponse> {
    const response = await voiceApi.post('/chat/text', request);
    return response.data;
  }

  async chatWithVoice(audioFile: File, language: string, sessionId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);

    const response = await voiceApi.post('/chat/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async searchHospitals(request: HospitalSearchRequest): Promise<HospitalSearchResponse> {
    const response = await voiceApi.post('/hospitals/search', request);
    return response.data;
  }

  async getEmergencyHospitals(city: string): Promise<HospitalSearchResponse> {
    const response = await voiceApi.get(`/hospitals/emergency/${city}`);
    return response.data;
  }

  async generateSpeech(text: string, language: string): Promise<Blob> {
    const response = await voiceApi.post('/tts/generate', null, {
      params: { text, language },
      responseType: 'blob',
    });
    return response.data;
  }

  async transcribeAudio(audioFile: File, language: string): Promise<{ transcription: string }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);

    const response = await voiceApi.post('/stt/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSupportedLanguages(): Promise<{ languages: Array<{ code: string; name: string; native_name: string }> }> {
    const response = await voiceApi.get('/languages/supported');
    return response.data;
  }

  async startSession(language: string): Promise<SessionResponse> {
    const response = await voiceApi.post('/session/start', { language });
    return response.data;
  }

  async endSession(sessionId: string): Promise<{ message: string }> {
    const response = await voiceApi.delete(`/session/${sessionId}`);
    return response.data;
  }

  // Real-time WebSocket methods
  connectWebSocket(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sessionId = sessionId;
      const wsUrl = `${WS_BASE_URL}/ws/voice/${sessionId}`;
      
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('WebSocket connected for voice session:', sessionId);
        resolve();
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message: VoiceResponse = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket connection closed');
        this.wsConnection = null;
      };
    });
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  sendWebSocketMessage(message: VoiceMessage): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    } else {
      console.error('WebSocket connection not available');
    }
  }

  // Start real-time voice session
  startRealtimeVoiceSession(language: string): void {
    this.sendWebSocketMessage({
      type: 'start',
      language,
    });
  }

  // Send audio chunk for processing
  sendAudioChunk(audioData: string): void {
    this.sendWebSocketMessage({
      type: 'audio',
      data: audioData,
    });
  }

  // End real-time voice session
  endRealtimeVoiceSession(): void {
    this.sendWebSocketMessage({
      type: 'end',
    });
  }

  // Get session status
  getSessionStatus(): void {
    this.sendWebSocketMessage({
      type: 'status',
    });
  }

  // Event handlers for WebSocket messages
  onSessionStarted(handler: (data: any) => void): void {
    this.messageHandlers.set('session_started', handler);
  }

  onAudioProcessed(handler: (data: any) => void): void {
    this.messageHandlers.set('audio_processed', handler);
  }

  onConversationResponse(handler: (data: any) => void): void {
    this.messageHandlers.set('conversation_response', handler);
  }

  onAudioResponse(handler: (data: any) => void): void {
    this.messageHandlers.set('audio_response', handler);
  }

  onSessionEnded(handler: (data: any) => void): void {
    this.messageHandlers.set('session_ended', handler);
  }

  onError(handler: (data: any) => void): void {
    this.messageHandlers.set('error', handler);
  }

  private handleWebSocketMessage(message: VoiceResponse): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      console.log('Unhandled WebSocket message type:', message.type, message.data);
    }
  }
}

// Export singleton instance
export const voiceAssistantAPI = new VoiceAssistantAPI();

// Audio utilities for real-time processing
export class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
        };

        this.mediaRecorder.stop();
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
      }
    });
  }

  // Convert audio blob to base64 for WebSocket transmission
  async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioBlob);
    });
  }

  // Convert base64 audio to playable URL
  base64ToAudioUrl(base64Audio: string): string {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  }
}

export const audioProcessor = new AudioProcessor();