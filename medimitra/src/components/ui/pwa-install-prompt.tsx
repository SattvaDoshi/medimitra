import { useEffect, useState } from 'react';
import { Button } from './button';
import { SmartphoneIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsDialogOpen(true);
  };

  const handleInstallInDialog = async () => {
    if (deferredPrompt) {
      // If we have a deferred prompt, use it
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    } else {
      // If no deferred prompt, show instructions based on platform
      // The dialog will handle this
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <SmartphoneIcon className="h-4 w-4" />
          Install Mobile App
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install MediMitra App</DialogTitle>
            <DialogDescription>
              {deferredPrompt ? (
                <div className="space-y-4">
                  <p>Install MediMitra on your device for the best experience:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Quick access from your home screen</li>
                    <li>Faster loading times</li>
                    <li>Offline functionality</li>
                    <li>Better performance</li>
                  </ul>
                  <Button onClick={handleInstallInDialog} className="w-full mt-4">
                    Install Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>To install MediMitra on your device:</p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">On Android (Chrome):</h4>
                      <ol className="list-decimal pl-6 space-y-1">
                        <li>Tap the menu icon (⋮)</li>
                        <li>Tap 'Add to Home screen'</li>
                        <li>Follow the installation prompts</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold">On iPhone (Safari):</h4>
                      <ol className="list-decimal pl-6 space-y-1">
                        <li>Tap the share icon (□↑)</li>
                        <li>Scroll and tap 'Add to Home Screen'</li>
                        <li>Tap 'Add' to confirm</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}