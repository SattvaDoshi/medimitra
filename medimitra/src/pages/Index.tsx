import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { HeroButton } from '@/components/ui/hero-button';
import { ServiceCard } from '@/components/ui/service-card';
import heroImage from '@/assets/hero-telemedicine-new.jpg';
import { 
  Video, 
  Wifi, 
  Hospital, 
  Pill, 
  Bot, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Video,
      title: t('landing.features.video'),
      description: 'Connect face-to-face with qualified doctors'
    },
    {
      icon: Wifi,
      title: t('landing.features.offline'),
      description: 'Access health records without internet'
    },
    {
      icon: Hospital,
      title: t('landing.features.hospital'),
      description: 'Find nearest hospitals and clinics'
    },
    {
      icon: Pill,
      title: t('landing.features.medicine'),
      description: 'Locate medicines at best prices'
    },
    {
      icon: Bot,
      title: t('landing.features.ai'),
      description: 'AI-powered symptom analysis'
    }
  ];

  const benefits = [
    { text: 'Available in Punjabi, Hindi & English', icon: CheckCircle },
    { text: 'Works offline for health records', icon: CheckCircle },
    { text: '173 villages connected', icon: CheckCircle },
    { text: '24/7 emergency support', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header showEmergency={false} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="MediMitra telemedicine consultation"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-primary/5 to-secondary/10" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <Heart className="h-16 w-16 mx-auto mb-6 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              {t('landing.title')}
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground mb-2">
              {t('landing.subtitle')}
            </h2>
            <p className="text-lg md:text-xl text-primary font-semibold mb-8">
              {t('landing.tagline')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-lg text-muted-foreground mb-8">
              {t('landing.description')}
            </p>
            
            <HeroButton 
              size="xl" 
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
              className="shadow-strong hover:shadow-glow"
            >
              {t('landing.cta')}
            </HeroButton>
          </div>

          {/* Benefits */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur rounded-lg border shadow-soft">
                <benefit.icon className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Healthcare Solution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for better healthcare access in rural areas
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <ServiceCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-card border">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Health Journey Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of patients already using our telemedicine platform
            </p>
            <HeroButton 
              size="xl"
              onClick={() => navigate('/dashboard')}
            >
              Access Dashboard
            </HeroButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
