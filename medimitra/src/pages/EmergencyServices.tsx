import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Ambulance, 
  AlertTriangle,
  MapPin,
  Clock,
  Heart,
  Shield,
  Navigation,
  Users,
  Activity
} from 'lucide-react';

const EmergencyServices = () => {
  const { t } = useTranslation();
  const [emergencyType, setEmergencyType] = useState('');

  const emergencyNumbers = [
    {
      service: 'Ambulance',
      number: '108',
      description: 'Free emergency ambulance service',
      category: 'medical',
      response: '15-20 minutes',
      coverage: 'All India',
      icon: Ambulance,
      urgent: true
    },
    {
      service: 'Police',
      number: '100',
      description: 'Police emergency and law enforcement',
      category: 'security',
      response: '10-15 minutes',
      coverage: 'All India',
      icon: Shield,
      urgent: true
    },
    {
      service: 'Fire Service',
      number: '101',
      description: 'Fire emergency and rescue operations',
      category: 'fire',
      response: '12-18 minutes',
      coverage: 'All India',
      icon: AlertTriangle,
      urgent: true
    },
    {
      service: 'Women Helpline',
      number: '1091',
      description: 'Women in distress emergency helpline',
      category: 'women',
      response: '24/7 Support',
      coverage: 'All India',
      icon: Users,
      urgent: false
    },
    {
      service: 'Child Helpline',
      number: '1098',
      description: 'Children in need of care and protection',
      category: 'child',
      response: '24/7 Support',
      coverage: 'All India',
      icon: Heart,
      urgent: false
    },
    {
      service: 'Disaster Management',
      number: '1070',
      description: 'Natural disasters and emergency management',
      category: 'disaster',
      response: 'Variable',
      coverage: 'All India',
      icon: AlertTriangle,
      urgent: false
    }
  ];

  const nearbyHospitals = [
    {
      name: 'Civil Hospital Nabha',
      distance: '2.3 km',
      emergency: true,
      ambulance: true,
      phone: '+91-1765-222000',
      beds: 45,
      icu: true
    },
    {
      name: 'Max Healthcare',
      distance: '3.1 km',
      emergency: true,
      ambulance: true,
      phone: '+91-1765-333000',
      beds: 120,
      icu: true
    },
    {
      name: 'Apollo Emergency',
      distance: '4.5 km',
      emergency: true,
      ambulance: true,
      phone: '+91-1765-444000',
      beds: 80,
      icu: true
    }
  ];

  const firstAidTips = [
    {
      emergency: 'Heart Attack',
      steps: [
        'Call 108 immediately',
        'Help person sit comfortably',
        'Give aspirin if not allergic',
        'Loosen tight clothing',
        'Monitor breathing and pulse'
      ],
      warning: 'Do not leave person alone'
    },
    {
      emergency: 'Snake Bite',
      steps: [
        'Keep victim calm and still',
        'Remove jewelry before swelling',
        'Mark swelling progression',
        'Do not cut or suck the wound',
        'Get to hospital immediately'
      ],
      warning: 'Do not apply tourniquet'
    },
    {
      emergency: 'Heat Stroke',
      steps: [
        'Move to shade or cool area',
        'Remove excess clothing',
        'Apply cool water to skin',
        'Fan the person',
        'Give cool water if conscious'
      ],
      warning: 'Monitor temperature continuously'
    },
    {
      emergency: 'Poisoning',
      steps: [
        'Call Poison Control 1066',
        'Identify the poison if possible',
        'Do not induce vomiting',
        'Keep airway clear',
        'Rush to nearest hospital'
      ],
      warning: 'Save poison container for identification'
    }
  ];

  const handleEmergencyCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'text-destructive';
      case 'security': return 'text-primary';
      case 'fire': return 'text-orange-500';
      case 'women': return 'text-pink-500';
      case 'child': return 'text-purple-500';
      default: return 'text-accent';
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
            🚑 Emergency Services
          </h1>
          <p className="text-lg text-muted-foreground">
            Immediate access to emergency help and first aid guidance
          </p>
        </div>

        {/* Quick Emergency Buttons */}
        <Card className="mb-8 bg-gradient-to-r from-destructive/10 to-warning/10 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive text-center">
              🚨 EMERGENCY - Call Immediately
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button 
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-20 text-lg font-bold"
                onClick={() => handleEmergencyCall('108')}
              >
                <div className="text-center">
                  <Ambulance className="h-8 w-8 mx-auto mb-1" />
                  <div>Ambulance 108</div>
                </div>
              </Button>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-20 text-lg font-bold"
                onClick={() => handleEmergencyCall('100')}
              >
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-1" />
                  <div>Police 100</div>
                </div>
              </Button>
              <Button 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white h-20 text-lg font-bold"
                onClick={() => handleEmergencyCall('101')}
              >
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-1" />
                  <div>Fire 101</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* All Emergency Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-6 w-6 text-primary" />
                  All Emergency Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {emergencyNumbers.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <div 
                        key={index} 
                        className={`p-4 border rounded-lg ${service.urgent ? 'border-destructive/50 bg-destructive/5' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className={`h-6 w-6 ${getCategoryColor(service.category)}`} />
                            <h3 className="font-semibold">{service.service}</h3>
                          </div>
                          <Badge 
                            variant={service.urgent ? 'destructive' : 'outline'}
                            className="font-bold"
                          >
                            {service.number}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.response}
                          </span>
                          <span>{service.coverage}</span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full"
                          variant={service.urgent ? 'destructive' : 'outline'}
                          onClick={() => handleEmergencyCall(service.number)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call {service.number}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Nearest Emergency Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-secondary" />
                  Nearest Emergency Hospitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyHospitals.map((hospital, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{hospital.name}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {hospital.distance} away
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-success/10 text-success mb-1">
                            24/7 Emergency
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{hospital.beds} beds available</span>
                        <span>{hospital.icu ? '✓ ICU Available' : '✗ No ICU'}</span>
                        <span>{hospital.ambulance ? '✓ Ambulance' : '✗ No Ambulance'}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Navigation className="h-4 w-4 mr-2" />
                          Directions
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEmergencyCall(hospital.phone.replace(/[^\d]/g, ''))}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Hospital
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* First Aid Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-accent" />
                  Quick First Aid Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {firstAidTips.map((tip, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-destructive mb-3">{tip.emergency}</h3>
                      
                      <ol className="space-y-1 text-sm mb-3">
                        {tip.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      
                      <div className="p-2 bg-warning/10 rounded text-xs text-warning border border-warning/20">
                        <strong>Warning:</strong> {tip.warning}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Emergency Preparedness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Keep emergency numbers saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>First aid kit at home</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Know nearest hospital route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Medical history document ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Emergency contact list updated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Share My Location
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Emergency Contacts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Medical Information
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  First Aid Training
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Response Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">15min</p>
                  <p className="text-sm text-muted-foreground">Avg Ambulance Response</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">98%</p>
                  <p className="text-sm text-muted-foreground">Emergency Call Success</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Service Availability</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyServices;