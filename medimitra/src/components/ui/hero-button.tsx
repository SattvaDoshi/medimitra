import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface HeroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'emergency';
  size?: 'default' | 'lg' | 'xl';
  className?: string;
}

export const HeroButton = ({ 
  children, 
  onClick, 
  icon: Icon, 
  variant = 'primary',
  size = 'lg',
  className 
}: HeroButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emergency':
        return 'btn-emergency';
      case 'secondary':
        return 'bg-gradient-secondary hover:bg-gradient-to-r hover:from-secondary-light hover:to-secondary';
      default:
        return 'btn-hero';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xl':
        return 'px-12 py-6 text-xl';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'touch-target font-semibold border-0',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {children}
    </Button>
  );
};