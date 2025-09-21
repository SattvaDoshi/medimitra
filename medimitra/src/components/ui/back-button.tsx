import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'default';
}

export const BackButton = ({ 
  to = '/dashboard', 
  label = 'Back to Dashboard',
  className,
  variant = 'ghost' 
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant={variant}
      size="sm"
      onClick={() => navigate(to)}
      className={cn("gap-2 mb-4", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};