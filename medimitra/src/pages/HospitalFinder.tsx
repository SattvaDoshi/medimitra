import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { ServiceCard } from '@/components/ui/service-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Hospital, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Star,
  Users,
  Stethoscope,
  Ambulance,
  ArrowLeft
} from 'lucide-react';

const HospitalFinder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');

  const hospitals = [
    {
      name: 'Civil Hospital Nabha',
      type: 'Government',
      distance: '2.3 km',
      rating: 4.2,
      travelTime: '8 mins',
      specialties: ['General Medicine', 'Emergency', 'Pediatrics'],
      doctorsAvailable: 5,
      emergency: true,
      phone: '+91-1765-222000'
    },
    {
      name: 'Max Healthcare',
      type: 'Private',
      distance: '3.1 km',
      rating: 4.8,
      travelTime: '12 mins',
      specialties: ['Cardiology', 'Orthopedics', 'Neurology'],
      doctorsAvailable: 8,
      emergency: true,
      phone: '+91-1765-333000'
    },
    {
      name: 'Apollo Clinic',
      type: 'Private',
      distance: '4.5 km',
      rating: 4.5,
      travelTime: '15 mins',
      specialties: ['Gynecology', 'Dermatology', 'ENT'],
      doctorsAvailable: 3,
      emergency: false,
      phone: '+91-1765-444000'
    },
    {
      name: 'Primary Health Center',
      type: 'Government',
      distance: '1.8 km',
      rating: 3.8,
      travelTime: '6 mins',
      specialties: ['General Medicine', 'Vaccination'],
      doctorsAvailable: 2,
      emergency: false,
      phone: '+91-1765-555000'
    }
  ];

  const emergencyServices = [
    { name: 'Ambulance 108', phone: '108', description: 'Free emergency ambulance' },
    { name: 'Fire Service', phone: '101', description: 'Fire emergency' },
    { name: 'Police', phone: '100', description: 'Police emergency' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            🏥 {t('dashboard.services.hospital')}
          </h1>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={() => navigate('/appointment-booking')} size="sm" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button onClick={() => navigate('/emergency-services')} size="sm" variant="outline">
              <Ambulance className="h-4 w-4 mr-2" />
              Emergency Services
            </Button>
            <Button onClick={() => navigate('/consultation')} size="sm" variant="outline">
              <Stethoscope className="h-4 w-4 mr-2" />
              Online Consultation
            </Button>
          </div>
          
          {/* Search */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Enter your location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 text-lg py-3"
            />
            <Button size="lg" className="px-6">
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">🚨 Emergency Services</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {emergencyServices.map((service, index) => (
              <Card key={index} className="bg-gradient-to-r from-destructive/10 to-warning/10 border-destructive/20">
                <CardContent className="p-4 text-center">
                  <Ambulance className="h-8 w-8 mx-auto mb-2 text-destructive" />
                  <h3 className="font-bold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => window.open(`tel:${service.phone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call {service.phone}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hospitals List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Nearby Hospitals</h2>
          <div className="space-y-4">
            {hospitals.map((hospital, index) => (
              <Card key={index} className="service-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Hospital className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">{hospital.name}</h3>
                        {hospital.emergency && (
                          <Badge variant="destructive" className="text-xs">
                            24/7 Emergency
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {hospital.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {hospital.travelTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {hospital.rating}
                        </span>
                      </div>
                      <Badge variant={hospital.type === 'Government' ? 'secondary' : 'outline'} className="mb-2">
                        {hospital.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm mb-2">
                        <Users className="h-4 w-4 text-success" />
                        <span>{hospital.doctorsAvailable} doctors available</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate('/appointment-booking')}
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Hospital className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">12</h3>
              <p className="text-sm text-muted-foreground">Hospitals Connected</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">18</h3>
              <p className="text-sm text-muted-foreground">Doctors On Duty</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Ambulance className="h-8 w-8 mx-auto mb-3 text-destructive" />
              <h3 className="font-semibold mb-2">24/7</h3>
              <p className="text-sm text-muted-foreground">Emergency Service</p>
            </CardContent>
          </Card>

          <Card className="service-card text-center">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">&lt;10min</h3>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HospitalFinder;