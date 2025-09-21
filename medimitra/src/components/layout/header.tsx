import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Heart, Home, Phone } from 'lucide-react';

interface HeaderProps {
  showEmergency?: boolean;
}

export const Header = ({ showEmergency = true }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEmergencyCall = () => {
    navigate('/emergency-services');
  };

  return (
    <header className="mobile-header sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mobile-touch-target"
          onClick={() => navigate('/dashboard')}
        >
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">
            MediMitra
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex gap-2 mobile-touch-target"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          
          {showEmergency && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmergencyCall}
              className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground mobile-touch-target text-xs"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden xs:inline text-xs">{t('common.emergency')}</span>
              <span className="xs:hidden">SOS</span>
            </Button>
          )}
          
          <div className="flex items-center">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};