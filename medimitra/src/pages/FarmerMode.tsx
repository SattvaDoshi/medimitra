import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wheat, 
  Thermometer, 
  Droplets,
  AlertTriangle,
  Shield,
  Sun,
  Cloud,
  Wind,
  Bug,
  Stethoscope,
  Phone
} from 'lucide-react';

const FarmerMode = () => {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('wheat');

  const cropHealthRisks = {
    wheat: [
      { risk: 'Dust Inhalation', season: 'Harvesting', prevention: 'Use N95 masks, avoid windy days' },
      { risk: 'Back Pain', season: 'All seasons', prevention: 'Proper posture, regular breaks' },
      { risk: 'Sun Exposure', season: 'Summer', prevention: 'Work early morning/evening, use sunscreen' }
    ],
    rice: [
      { risk: 'Waterborne Diseases', season: 'Monsoon', prevention: 'Clean water, avoid stagnant water' },
      { risk: 'Skin Infections', season: 'Planting', prevention: 'Protective clothing, keep feet dry' },
      { risk: 'Respiratory Issues', season: 'Harvesting', prevention: 'Use masks during threshing' }
    ],
    cotton: [
      { risk: 'Pesticide Exposure', season: 'Growing', prevention: 'Protective gear, proper storage' },
      { risk: 'Heat Stroke', season: 'Summer', prevention: 'Frequent water breaks, shade' },
      { risk: 'Eye Irritation', season: 'Spraying', prevention: 'Safety goggles, face protection' }
    ]
  };

  const weatherHealthAlerts = [
    {
      condition: 'Extreme Heat (>40°C)',
      risks: ['Heat Stroke', 'Dehydration', 'Heat Exhaustion'],
      precautions: [
        'Work before 10 AM and after 4 PM',
        'Drink water every 30 minutes',
        'Wear light-colored, loose clothing',
        'Take breaks in shade frequently'
      ],
      urgency: 'high',
      icon: Sun
    },
    {
      condition: 'Heavy Monsoon',
      risks: ['Vector-borne diseases', 'Skin infections', 'Waterborne diseases'],
      precautions: [
        'Use mosquito repellent',
        'Avoid stagnant water',
        'Wear waterproof boots',
        'Maintain personal hygiene'
      ],
      urgency: 'medium',
      icon: Cloud
    },
    {
      condition: 'Dust Storms',
      risks: ['Respiratory problems', 'Eye infections', 'Skin irritation'],
      precautions: [
        'Stay indoors during storms',
        'Use N95 masks outdoors',
        'Protect eyes with goggles',
        'Clean nose and throat regularly'
      ],
      urgency: 'medium',
      icon: Wind
    }
  ];

  const seasonalDiseases = [
    {
      name: 'Dengue',
      season: 'Post-Monsoon',
      symptoms: ['High fever', 'Body aches', 'Rash'],
      prevention: 'Remove standing water, use mosquito nets'
    },
    {
      name: 'Heat Stroke',
      season: 'Summer (April-June)',
      symptoms: ['High body temperature', 'Confusion', 'Rapid pulse'],
      prevention: 'Stay hydrated, avoid midday sun'
    },
    {
      name: 'Pesticide Poisoning',
      season: 'Crop Season',
      symptoms: ['Nausea', 'Dizziness', 'Skin irritation'],
      prevention: 'Use protective equipment, read labels'
    },
    {
      name: 'Snake Bites',
      season: 'Monsoon',
      symptoms: ['Bite marks', 'Swelling', 'Pain'],
      prevention: 'Wear boots, use torch at night'
    }
  ];

  const emergencyContacts = [
    { service: 'Ambulance', number: '108', description: 'Medical emergencies' },
    { service: 'Poison Control', number: '1066', description: 'Pesticide poisoning' },
    { service: 'Farmer Helpline', number: '1800-180-1551', description: 'Agricultural support' },
    { service: 'Women Helpline', number: '1091', description: 'Women in distress' }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-destructive text-destructive bg-destructive/10';
      case 'medium': return 'border-warning text-warning bg-warning/10';
      default: return 'border-success text-success bg-success/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            🌾 Farmer Health Mode
          </h1>
          <p className="text-lg text-muted-foreground">
            Specialized health guidance for agricultural workers
          </p>
        </div>

        {/* Weather-Based Health Alerts */}
        <Card className="mb-8 bg-gradient-to-r from-warning/10 to-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-6 w-6 text-warning" />
              Today's Weather Health Advisory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Sun className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-semibold">42°C High Heat</p>
                  <p className="text-sm text-destructive">Extreme caution advised</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Droplets className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-semibold">20% Humidity</p>
                  <p className="text-sm text-muted-foreground">Stay hydrated</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Wind className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="font-semibold">15 km/h Wind</p>
                  <p className="text-sm text-muted-foreground">Dusty conditions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crop-Specific Health Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-6 w-6 text-secondary" />
                  Crop-Specific Health Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Crop Selection */}
                <div className="flex gap-2 mb-6">
                  {Object.keys(cropHealthRisks).map((crop) => (
                    <Button
                      key={crop}
                      size="sm"
                      variant={selectedCrop === crop ? 'default' : 'outline'}
                      onClick={() => setSelectedCrop(crop)}
                    >
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Risk Details */}
                <div className="space-y-4">
                  {cropHealthRisks[selectedCrop as keyof typeof cropHealthRisks]?.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-destructive">{risk.risk}</h3>
                        <Badge variant="outline">{risk.season}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Prevention:</strong> {risk.prevention}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weather-Based Health Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  Weather-Based Health Precautions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weatherHealthAlerts.map((alert, index) => {
                    const IconComponent = alert.icon;
                    return (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(alert.urgency)}`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className="h-6 w-6 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{alert.condition}</h3>
                            
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Health Risks:</p>
                              <div className="flex flex-wrap gap-2">
                                {alert.risks.map((risk, idx) => (
                                  <Badge key={idx} variant="destructive" className="text-xs">
                                    {risk}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">Precautions:</p>
                              <ul className="text-sm space-y-1">
                                {alert.precautions.map((precaution, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Shield className="h-3 w-3 text-success mt-1" />
                                    <span>{precaution}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Disease Prevention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-6 w-6 text-accent" />
                  Seasonal Disease Prevention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {seasonalDiseases.map((disease, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-destructive">{disease.name}</h3>
                        <Badge variant="outline" className="text-xs">{disease.season}</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium">Symptoms:</p>
                        <p className="text-sm text-muted-foreground">{disease.symptoms.join(', ')}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Prevention:</p>
                        <p className="text-sm text-muted-foreground">{disease.prevention}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">🚨 Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-sm">{contact.service}</h3>
                        <Badge variant="destructive">{contact.number}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => window.open(`tel:${contact.number}`, '_self')}
                      >
                        <Phone className="h-3 w-3 mr-2" />
                        Call {contact.number}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Health Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Quick Health Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  Symptom Checker
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Find Nearest Doctor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  First Aid Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Medication Reminder
                </Button>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Daily Health Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Hydration Reminder</p>
                    <p>Drink at least 3-4 liters of water daily during farm work</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Rest Breaks</p>
                    <p>Take 15-minute breaks every 2 hours of continuous work</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Protective Gear</p>
                    <p>Always wear gloves when handling fertilizers and pesticides</p>
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

export default FarmerMode;