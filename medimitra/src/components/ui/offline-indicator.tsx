import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
      isOnline 
        ? 'bg-success text-success-foreground shadow-soft' 
        : 'bg-warning text-warning-foreground shadow-medium animate-pulse'
    )}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  );
};