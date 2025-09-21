import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  Mic, 
  Send, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Thermometer,
  Activity
} from 'lucide-react';

const AISymptomChecker = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      message: 'Hello! I\'m your AI health assistant. Please describe your symptoms in your preferred language.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const commonSymptoms = [
    { name: 'Fever', icon: Thermometer, urgency: 'medium' },
    { name: 'Headache', icon: Activity, urgency: 'low' },
    { name: 'Cough', icon: Heart, urgency: 'low' },
    { name: 'Chest Pain', icon: AlertTriangle, urgency: 'high' },
    { name: 'Stomach Pain', icon: Activity, urgency: 'medium' },
    { name: 'Dizziness', icon: Activity, urgency: 'medium' }
  ];

  const ruralDiseases = [
    { name: 'Dengue', symptoms: ['High fever', 'Joint pain', 'Rash'], season: 'Monsoon' },
    { name: 'Malaria', symptoms: ['Fever', 'Chills', 'Headache'], season: 'Post-monsoon' },
    { name: 'Typhoid', symptoms: ['Prolonged fever', 'Weakness', 'Abdominal pain'], season: 'Summer' },
    { name: 'Heat Stroke', symptoms: ['High body temperature', 'Confusion', 'Hot dry skin'], season: 'Summer' }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        message: 'Based on your symptoms, I recommend consulting with a doctor. Here are some immediate care suggestions:\n\n• Stay hydrated\n• Rest well\n• Monitor your temperature\n• If symptoms worsen, seek immediate medical attention',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSymptomClick = (symptom: string) => {
    setInputMessage(symptom);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted animate-fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <BackButton />
        
        {/* Header */}
        <div className="mb-8 animate-fade-in animation-delay-200">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4 animate-scale-in">
            🤖 AI Symptom Checker
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe your symptoms and get immediate health guidance
          </p>
        </div>

        {/* Warning Banner */}
        <Card className="mb-6 bg-gradient-to-r from-warning/10 to-destructive/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">Medical Disclaimer</h3>
                <p className="text-sm">This AI tool provides general guidance only. Always consult a qualified doctor for proper diagnosis and treatment.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  AI Health Assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 animate-pulse" />
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe your symptoms..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Common Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {commonSymptoms.map((symptom, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => handleSymptomClick(symptom.name)}
                    >
                      <symptom.icon className={`h-4 w-4 mr-2 ${getUrgencyColor(symptom.urgency)}`} />
                      <span>{symptom.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rural Disease Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Rural Diseases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ruralDiseases.map((disease, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{disease.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {disease.season}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {disease.symptoms.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Actions */}
            <Card className="bg-gradient-to-r from-destructive/10 to-warning/10">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Emergency?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  If you have severe symptoms, call immediately:
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full mb-2"
                  onClick={() => window.open('tel:108', '_self')}
                >
                  Call 108 - Ambulance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('/consultation', '_self')}
                >
                  Video Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AISymptomChecker;