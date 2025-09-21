import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Bot,
  RotateCcw,
  MessageCircle,
  Send,
  Phone,
  PhoneOff,
  AlertTriangle,
  Hospital,
  Loader2,
} from "lucide-react";

const VoiceAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [textInput, setTextInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState("");
  const [wsConnection, setWsConnection] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const quickPhrases = {
    en: [
      "What are the symptoms of fever?",
      "Find nearest doctor",
      "Emergency help needed",
      "I have headache and fever",
    ],
    hi: [
      "बखर क लकषण कय ह?",
      "नजदक डकटर खज",
      "आपतकलन सहयत चहए",
      "मझ सरदरद और बखर ह",
    ],
  };

  const languages = [
    { code: "en", name: "English", native_name: "English" },
    { code: "hi", name: "Hindi", native_name: "हद" },
  ];

  // Audio playback function
  const playAudioFromBase64 = async (base64Audio) => {
    if (!audioEnabled) return;

    try {
      setIsSpeaking(true);
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsSpeaking(false);
    }
  };

  // Start continuous voice call mode
  const startVoiceCall = async () => {
    try {
      setError("");
      console.log("🎤 Starting voice call mode...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("✅ Microphone access granted, stream created:", stream);
      console.log("🔊 Audio tracks:", stream.getAudioTracks());

      // Test audio level detection
      try {
        console.log("🎯 Creating audio context for level monitoring...");
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        console.log("🎯 Audio context created successfully");

        // Monitor audio levels
        const checkAudioLevel = () => {
          try {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            if (average > 5) {
              // Lower threshold for testing
              console.log("🎵 Audio level detected:", average);
            }
          } catch (levelError) {
            console.error("❌ Error checking audio level:", levelError);
          }
        };

        // Check audio levels every 500ms
        console.log("🎯 Starting audio level monitoring...");
        const audioLevelInterval = setInterval(checkAudioLevel, 500);

        // Clean up interval when call ends
        setTimeout(() => {
          if (!isCallActive) {
            clearInterval(audioLevelInterval);
            audioContext.close();
          }
        }, 1000);
      } catch (audioError) {
        console.error("❌ Error setting up audio monitoring:", audioError);
      }

      setCurrentStream(stream);
      setIsCallActive(true);
      setIsListening(true);

      console.log("🎯 About to start continuous recording...");
      console.log("🎯 isCallActive will be:", true);
      console.log("🎯 Stream for recording:", stream);

      // Start continuous recording
      try {
        console.log("🎯 Calling startContinuousRecording...");
        startContinuousRecording(stream, true); // Pass callActive = true directly
        console.log("🎯 startContinuousRecording called successfully");
      } catch (error) {
        console.error("❌ Error starting continuous recording:", error);
      }
    } catch (error) {
      console.error("❌ Failed to start voice call:", error);
      setError(
        "Microphone access denied. Please allow microphone permissions."
      );
      setIsCallActive(false);
      setIsListening(false);
    }
  };

  // Continuous recording with auto-restart
  const startContinuousRecording = (stream, callActive = null) => {
    // Use passed parameter or fall back to state
    const isActive = callActive !== null ? callActive : isCallActive;

    console.log("🎙️ startContinuousRecording called with stream:", stream);
    console.log("🎙️ callActive parameter:", callActive);
    console.log("🎙️ isCallActive state:", isCallActive);
    console.log("🎙️ Using isActive:", isActive);

    if (!isActive) {
      console.log("❌ Call not active, returning early");
      return;
    }

    console.log("🎙️ Starting continuous recording with stream:", stream);

    try {
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      console.log("📹 MediaRecorder created, state:", recorder.state);
      console.log("📹 MediaRecorder mime type:", recorder.mimeType);

      recorder.ondataavailable = (event) => {
        console.log("📊 Audio data available, size:", event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log("📊 Added chunk, total chunks:", chunks.length);
        }
      };

      recorder.onstop = async () => {
        console.log(
          "🛑 Recording stopped, processing audio chunks:",
          chunks.length
        );
        console.log("🛑 Current isCallActive state:", isCallActive);
        console.log("🛑 Current wsConnection state:", wsConnection?.readyState);

        // Create audio blob with WebM format (backend will convert to WAV)
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("📦 Created audio blob, size:", audioBlob.size, "bytes"); // Process if we have audio data and WebSocket is connected (regardless of call state)
        if (
          audioBlob.size > 5000 &&
          wsConnection &&
          wsConnection.readyState === WebSocket.OPEN
        ) {
          console.log(
            "✅ Audio blob size sufficient and WebSocket connected, processing..."
          );
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === "string") {
              const base64Audio = result.split(",")[1];
              console.log("🔤 Base64 audio length:", base64Audio.length);

              console.log("📤 Sending audio data via WebSocket...");

              const message = {
                type: "voice_data", // or "audio" - backend supports both
                audio: base64Audio,
                language: currentLanguage,
                continuous: true,
              };

              console.log("📤 Message to send:", {
                ...message,
                audio: `[${base64Audio.length} chars of base64 audio]`,
              });

              wsConnection.send(JSON.stringify(message));
              setIsProcessing(true);
              console.log("✅ Audio data sent successfully");
            }
          };
          reader.readAsDataURL(audioBlob);
        } else {
          if (audioBlob.size <= 5000) {
            console.log(
              "⚠️ Audio blob too small, skipping processing. Size:",
              audioBlob.size
            );
          } else if (
            !wsConnection ||
            wsConnection.readyState !== WebSocket.OPEN
          ) {
            console.log(
              "⚠️ WebSocket not available for sending audio. State:",
              wsConnection?.readyState
            );
          }
        }

        // Restart recording for continuous listening ONLY if call is still active
        if (isCallActive && currentStream) {
          console.log("🔄 Restarting recording in 100ms...");
          setTimeout(() => {
            startContinuousRecording(currentStream, isCallActive);
          }, 100);
        } else {
          console.log("🔄 Not restarting recording - call ended or no stream");
        }
      };

      recorder.onerror = (event) => {
        console.error("❌ MediaRecorder error:", event);
      };

      setMediaRecorder(recorder);
      recorder.start();
      console.log("🎬 Recording started, state:", recorder.state);

      // Auto-stop after 5 seconds to process voice segments (increased from 3s)
      setTimeout(() => {
        if (recorder.state === "recording") {
          console.log("⏰ Auto-stopping recorder after 5 seconds");
          recorder.stop();
        }
      }, 5000);
    } catch (recorderError) {
      console.error("❌ Error creating MediaRecorder:", recorderError);
    }
  };

  // Stop voice call
  const stopVoiceCall = () => {
    console.log("Ending voice call...");
    setIsCallActive(false);
    setIsListening(false);

    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }

    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      setCurrentStream(null);
    }

    setMediaRecorder(null);
  };

  // Handle voice button for call mode
  const handleVoiceToggle = async () => {
    if (!isConnected) {
      setError("Please connect first");
      return;
    }

    if (isCallActive) {
      stopVoiceCall();
    } else {
      await startVoiceCall();
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:8000/health");
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const connectWebSocket = async () => {
    setIsProcessing(true);
    setError("");

    const backendAvailable = await testBackendConnection();
    if (!backendAvailable) {
      setError(
        "Backend not available. Please start the Python backend server."
      );
      setIsProcessing(false);
      return;
    }

    try {
      const sessionId = "session_" + Date.now();
      const ws = new WebSocket(`ws://localhost:8000/ws/voice/${sessionId}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsProcessing(false);
        setWsConnection(ws);

        // Start the voice session
        ws.send(
          JSON.stringify({
            type: "start",
            language: currentLanguage,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);

        if (data.type === "session_started") {
          console.log("Voice session started", data.data);
          // Don't add greeting to conversation yet, wait for audio_response
        }

        if (data.type === "audio_response") {
          const { audio, text } = data.data;

          if (text) {
            setConversation((prev) => [
              ...prev,
              {
                type: "assistant",
                message: text,
                timestamp: new Date(),
                hasAudio: !!audio,
              },
            ]);
          }

          if (audio && audioEnabled) {
            playAudioFromBase64(audio);
          }

          setIsProcessing(false);
        }

        if (data.type === "conversation_response") {
          if (data.data.transcription) {
            setConversation((prev) => [
              ...prev,
              {
                type: "user",
                message: data.data.transcription,
                timestamp: new Date(),
                isVoice: true,
              },
            ]);
          }

          if (data.data.ai_response) {
            setConversation((prev) => [
              ...prev,
              {
                type: "assistant",
                message: data.data.ai_response,
                timestamp: new Date(),
                emergencyLevel: data.data.emergency_level,
                requiresHospital: data.data.requires_hospital,
                hasAudio: !!data.data.audio_response,
              },
            ]);

            if (data.data.audio_response && audioEnabled) {
              playAudioFromBase64(data.data.audio_response);
            }
          }

          setIsProcessing(false);
        }

        if (data.type === "audio_processed") {
          // Real-time feedback about voice processing
          console.log("Audio processed:", data.data);
        }

        if (data.type === "error") {
          console.error("WebSocket error:", data.data);
          setError(data.data.error || "An error occurred");
          setIsProcessing(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection failed. Check if backend is running.");
        setIsProcessing(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed", event.code, event.reason);
        setIsConnected(false);
        setWsConnection(null);
        setIsSpeaking(false);
        if (isCallActive) {
          stopVoiceCall();
        }
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to connect to voice assistant");
      setIsProcessing(false);
    }
  };

  const disconnectWebSocket = () => {
    if (isCallActive) {
      stopVoiceCall();
    }

    if (wsConnection) {
      // Send end message before closing
      wsConnection.send(
        JSON.stringify({
          type: "end",
        })
      );

      // Close the connection
      wsConnection.close();
    }

    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setWsConnection(null);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMessage = {
      type: "user",
      message: textInput,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    const messageToSend = textInput;
    setTextInput("");

    try {
      if (isConnected && wsConnection) {
        wsConnection.send(
          JSON.stringify({
            type: "text_message",
            message: messageToSend,
            language: currentLanguage,
          })
        );
      } else {
        const response = await fetch("http://localhost:8000/chat/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
            language: currentLanguage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConversation((prev) => [
            ...prev,
            {
              type: "assistant",
              message: data.response,
              timestamp: new Date(),
              emergencyLevel: data.emergency_level,
              requiresHospital: data.requires_hospital,
            },
          ]);
        } else {
          setError("Failed to get response");
        }
        setIsProcessing(false);
      }
    } catch (error) {
      setError("Failed to send message");
      setIsProcessing(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageIcon = (message) => {
    if (message.emergencyLevel === "high")
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (message.requiresHospital)
      return <Hospital className="h-4 w-4 text-orange-500" />;
    if (message.hasAudio) return <Volume2 className="h-4 w-4 text-blue-500" />;
    if (message.isVoice) return <Mic className="h-4 w-4 text-green-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            AI Voice Health Assistant (Call Mode)
          </h1>
          <p className="text-lg text-muted-foreground">
            Continuous voice conversation - just like a phone call!
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Voice Call Assistant
                    {isConnected && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Connected
                      </Badge>
                    )}
                    {isCallActive && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Call Active
                      </Badge>
                    )}
                    {isSpeaking && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        AI Speaking
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={
                        audioEnabled ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      {audioEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                    <Badge variant="outline">
                      {languages.find((l) => l.code === currentLanguage)
                        ?.native_name || "English"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const nextLang = currentLanguage === "en" ? "hi" : "en";
                        setCurrentLanguage(nextLang);
                      }}
                    >
                      <Languages className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  {!isConnected ? (
                    <Button
                      size="lg"
                      onClick={connectWebSocket}
                      className="w-32 h-32 rounded-full text-2xl bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Phone className="h-8 w-8" />
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className={`w-32 h-32 rounded-full text-2xl ${
                          isCallActive
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={handleVoiceToggle}
                        disabled={isProcessing || isSpeaking}
                      >
                        {isCallActive ? (
                          <PhoneOff className="h-8 w-8" />
                        ) : (
                          <Phone className="h-8 w-8" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={disconnectWebSocket}
                        className="text-red-600"
                      >
                        <PhoneOff className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 text-sm flex-wrap">
                    {isCallActive && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        On Call
                      </Badge>
                    )}
                    {isListening && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
                        <Mic className="h-3 w-3 mr-1" />
                        Listening
                      </Badge>
                    )}
                    {isProcessing && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing Voice
                      </Badge>
                    )}
                    {isSpeaking && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                        AI Speaking
                      </Badge>
                    )}
                  </div>

                  {isCallActive && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Just speak naturally - I'm listening continuously!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <Input
                    placeholder="Type your health question or use voice call..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isProcessing || isSpeaking || isCallActive}
                  />
                  <Button
                    type="submit"
                    disabled={
                      !textInput.trim() ||
                      isProcessing ||
                      isSpeaking ||
                      isCallActive
                    }
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Call Conversation
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConversation([])}
                  disabled={conversation.length === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {conversation.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No conversation yet. Click the phone button to start a
                        voice call!
                      </p>
                    ) : (
                      conversation.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTime(msg.timestamp)}
                                  {msg.isVoice && (
                                    <span className="ml-2 text-green-400">
                                      {" "}
                                      Voice Call
                                    </span>
                                  )}
                                </p>
                              </div>
                              {getMessageIcon(msg)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant={isCallActive ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={handleVoiceToggle}
                    disabled={!isConnected || isProcessing || isSpeaking}
                  >
                    {isCallActive ? (
                      <>
                        <PhoneOff className="h-4 w-4 mr-2" />
                        End Call
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Start Voice Call
                      </>
                    )}
                  </Button>

                  {isCallActive && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Call Active
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Speak naturally - continuous listening is on!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Phrases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(quickPhrases[currentLanguage] || quickPhrases.en).map(
                    (phrase, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-3"
                        onClick={() => setTextInput(phrase)}
                        disabled={isProcessing || isSpeaking || isCallActive}
                      >
                        <span className="text-xs">{phrase}</span>
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Call Status</span>
                    <Badge variant={isCallActive ? "default" : "secondary"}>
                      {isCallActive ? " Active" : "Ended"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connection</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-xs">
                        {isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCallActive
                      ? " Continuous voice conversation active"
                      : 'Click "Start Voice Call" to begin'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>Continuous Voice Call</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-red-500" />
                    <span>Auto Voice Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-blue-500" />
                    <span>Instant Audio Responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-green-500" />
                    <span>Multi-language Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceAssistant;
