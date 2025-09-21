import React from 'react';
import { Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'default' | 'heart';
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  text,
  variant = 'default'
}: LoadingSpinnerProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-12 w-12';
      default: return 'h-8 w-8';
    }
  };

  const Icon = variant === 'heart' ? Heart : Loader2;
  const animation = variant === 'heart' ? 'animate-pulse' : 'animate-spin';

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Icon className={cn(
        getSizeClasses(),
        animation,
        'text-primary'
      )} />
      {text && (
        <p className="text-sm text-muted-foreground text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
    <LoadingSpinner 
      size="lg" 
      text={text}
      variant="heart"
      className="p-8"
    />
  </div>
);