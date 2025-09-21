import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const VoiceAssistantTest = () => {
  const [status, setStatus] = useState('Not connected');
  const [response, setResponse] = useState('');

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setStatus('Connected successfully!');
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatus('Connection failed');
      setResponse(`Error: ${error.message}`);
    }
  };

  const testWebSocket = () => {
    try {
      setStatus('Testing WebSocket...');
      const ws = new WebSocket('ws://localhost:8000/ws/voice/test123');
      
      ws.onopen = () => {
        setStatus('WebSocket connected!');
        ws.send(JSON.stringify({ type: 'start', language: 'en' }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResponse(JSON.stringify(data, null, 2));
      };
      
      ws.onerror = () => {
        setStatus('WebSocket failed');
      };
      
      setTimeout(() => {
        ws.close();
      }, 3000);
      
    } catch (error) {
      setStatus('WebSocket test failed');
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Voice Assistant Integration Test</h1>
        
        <Alert>
          <AlertDescription>
            Status: {status}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Backend Connection Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testConnection} className="w-full">
                Test HTTP Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WebSocket Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testWebSocket} className="w-full">
                Test WebSocket
              </Button>
            </CardContent>
          </Card>
        </div>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {response}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">1. Start Python Backend:</h3>
              <code className="bg-gray-100 p-2 rounded block">
                cd python-backend && python main.py
              </code>
            </div>
            <div>
              <h3 className="font-semibold">2. Backend should be running on:</h3>
              <code className="bg-gray-100 p-2 rounded block">
                http://localhost:8000
              </code>
            </div>
            <div>
              <h3 className="font-semibold">3. Test the connection above</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistantTest;