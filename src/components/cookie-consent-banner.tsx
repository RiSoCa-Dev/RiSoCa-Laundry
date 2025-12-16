'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-50 p-4 bg-background/95 border-t shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium mb-1">
                We use cookies to improve your experience
              </p>
              <p className="text-xs text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept", you consent to our use of cookies.{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="text-xs"
            >
              Accept
            </Button>
            <Button
              onClick={handleDecline}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

