import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { BackButton } from '@/components/ui/back-button';
import { ServiceCard } from '@/components/ui/service-card';
import { HeroButton } from '@/components/ui/hero-button';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Phone, 
  Calendar, 
  UserCheck, 
  Clock, 
  Heart,
  Mic,
  MessageCircle,
  ArrowLeft,
  Stethoscope
} from 'lucide-react';

const Consultation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const consultationTypes = [
    {
      icon: Video,
      title: t('consultation.video'),
      description: 'Face-to-face video consultation',
      variant: 'primary' as const
    },
    {
      icon: Phone,
      title: t('consultation.voice'),
      description: 'Voice-only consultation',
      variant: 'secondary' as const
    },
    {
      icon: MessageCircle,
      title: 'Chat Consultation',
      description: 'Text-based consultation'
    },
    {
      icon: Mic,
      title: 'Voice Message',
      description: 'Send voice messages'
    }
  ];

  const specialists = [
    { name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', available: true },
    { name: 'Dr. Priya Sharma', specialty: 'Pediatrics', available: true },
    { name: 'Dr. Amit Singh', specialty: 'Cardiology', available: false },
    { name: 'Dr. Sunita Kaur', specialty: 'Gynecology', available: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <BackButton className="mx-auto" />
          
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            {t('consultation.title')}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Choose your preferred consultation method
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Button onClick={() => navigate('/appointment-booking')} size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button onClick={() => navigate('/ai-symptom-checker')} size="sm" variant="outline">
              <Stethoscope className="h-4 w-4 mr-2" />
              AI Symptom Checker
            </Button>
            <Button onClick={() => navigate('/voice-assistant')} size="sm" variant="outline">
              <Mic className="h-4 w-4 mr-2" />
              Voice Assistant
            </Button>
          </div>
          
          <HeroButton 
            icon={Calendar}
            size="xl"
            onClick={() => navigate('/appointment-booking')}
          >
            {t('consultation.book')}
          </HeroButton>
        </div>

        {/* Consultation Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Consultation Options</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {consultationTypes.map((type, index) => (
              <ServiceCard key={index} {...type} />
            ))}
          </div>
        </div>

        {/* Available Specialists */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Available Specialists</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {specialists.map((doctor, index) => (
              <div key={index} className="service-card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    doctor.available ? 'bg-success' : 'bg-muted-foreground'
                  }`} />
                  <span className="text-sm">
                    {doctor.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Section */}
        <div className="bg-gradient-to-r from-destructive/10 to-warning/10 rounded-2xl p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Medical Emergency?</h2>
          <p className="text-muted-foreground mb-4">
            For immediate medical attention, call our emergency hotline
          </p>
          <HeroButton 
            variant="emergency" 
            icon={Phone}
            onClick={() => navigate('/emergency-services')}
          >
            Call 108 - Emergency
          </HeroButton>
        </div>
      </main>
    </div>
  );
};

export default Consultation;