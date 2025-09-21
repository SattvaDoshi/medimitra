import React from 'react';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'emergency' | 'primary' | 'secondary';
  className?: string;
}

export const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  variant = 'default',
  className 
}: ServiceCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emergency':
        return 'bg-gradient-to-br from-destructive to-warning text-destructive-foreground hover:shadow-glow';
      case 'primary':
        return 'bg-gradient-primary text-primary-foreground';
      case 'secondary':
        return 'bg-gradient-secondary text-secondary-foreground';
      default:
        return 'service-card hover:bg-gradient-card';
    }
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer touch-target border-0',
        getVariantStyles(),
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[120px]">
        <Icon className={cn(
          'mb-3 transition-transform hover:scale-110',
          variant === 'emergency' ? 'h-8 w-8' : 'h-10 w-10'
        )} />
        <h3 className={cn(
          'font-semibold mb-1',
          'text-xl-rural md:text-2xl-rural'
        )}>
          {title}
        </h3>
        {description && (
          <p className="text-sm opacity-80 line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};