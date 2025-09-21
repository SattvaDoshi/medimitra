import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { ServiceCard } from '@/components/ui/service-card';
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  Bot, 
  Hospital, 
  Route,
  Heart,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      icon: Stethoscope,
      title: t('dashboard.services.consultation'),
      description: 'Video & Voice consultations',
      onClick: () => navigate('/consultation'),
      variant: 'primary' as const
    },
    {
      icon: Pill,
      title: t('dashboard.services.medicine'),
      description: 'Find medicines & pharmacies',
      onClick: () => navigate('/medicine')
    },
    {
      icon: FileText,
      title: t('dashboard.services.records'),
      description: 'Your health history',
      onClick: () => navigate('/health-records')
    },
    {
      icon: Bot,
      title: t('dashboard.services.ai'),
      description: 'AI symptom checker',
      onClick: () => navigate('/ai-symptom-checker')
    },
    {
      icon: Hospital,
      title: t('dashboard.services.hospital'),
      description: 'Nearest hospitals',
      onClick: () => navigate('/hospital-finder')
    },
    {
      icon: Route,
      title: t('dashboard.services.routes'),
      description: 'Safe route finder',
      onClick: () => navigate('/offline-maps')
    }
  ];

  const additionalServices = [
    {
      icon: MapPin,
      title: 'Pharmacy Locator',
      description: 'Find nearest pharmacies',
      onClick: () => navigate('/pharmacy-locator')
    },
    {
      icon: Heart,
      title: 'Price Comparison',
      description: 'Compare medicine prices',
      onClick: () => navigate('/price-comparison')
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule with doctors',
      onClick: () => navigate('/appointment-booking')
    },
    {
      icon: FileText,
      title: 'Lab Tests',
      description: 'Book lab tests',
      onClick: () => navigate('/lab-tests')
    },
    {
      icon: Phone,
      title: 'Voice Assistant',
      description: 'Speak for help',
      onClick: () => navigate('/voice-assistant')
    },
    {
      icon: Heart,
      title: 'Govt Schemes',
      description: 'Check eligibility',
      onClick: () => navigate('/govt-schemes')
    },
    {
      icon: MapPin,
      title: 'Community Health',
      description: 'Village health groups',
      onClick: () => navigate('/community-health')
    },
    {
      icon: Stethoscope,
      title: 'Farmer Mode',
      description: 'Crop health guidance',
      onClick: () => navigate('/farmer-mode')
    }
  ];

  const emergencyServices = [
    {
      icon: Phone,
      title: 'Ambulance 108',
      description: 'Emergency medical help',
      variant: 'emergency' as const,
      onClick: () => window.open('tel:108', '_self')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted animate-fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl-rural font-bold text-foreground mb-2 animate-scale-in">
            {t('dashboard.greeting')} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.quickAccess')}
          </p>
        </div>

        {/* Emergency Section */}
        <div className="mb-8 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">🚨 Emergency Services</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {emergencyServices.map((service, index) => (
              <div key={index} className="hover-scale">
                <ServiceCard {...service} />
              </div>
            ))}
            <div className="hover-scale">
              <ServiceCard
                icon={Phone}
                title="All Emergency Services"
                description="View all emergency contacts"
                onClick={() => navigate('/emergency-services')}
              />
            </div>
          </div>
        </div>

        {/* Main Services */}
        <div className="mb-8 animate-fade-in animation-delay-400">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">🩺 Core Health Services</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={index} className="hover-scale">
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-8 animate-fade-in animation-delay-500">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">⚡ More Services</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {additionalServices.map((service, index) => (
              <div key={index} className="hover-scale">
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in animation-delay-1000">
          <div className="service-card text-center hover-scale">
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
            <h3 className="font-semibold">173</h3>
            <p className="text-sm text-muted-foreground">Villages Connected</p>
          </div>
          <div className="service-card text-center hover-scale">
            <Stethoscope className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <h3 className="font-semibold">50+</h3>
            <p className="text-sm text-muted-foreground">Doctors Available</p>
          </div>
          <div className="service-card text-center hover-scale">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">24/7</h3>
            <p className="text-sm text-muted-foreground">Emergency Support</p>
          </div>
          <div className="service-card text-center hover-scale">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-success" />
            <h3 className="font-semibold">1000+</h3>
            <p className="text-sm text-muted-foreground">Consultations Done</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;