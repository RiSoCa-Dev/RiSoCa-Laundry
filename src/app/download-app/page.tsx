'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  CheckCircle2, 
  Smartphone, 
  Zap, 
  Bell, 
  Shield, 
  Sparkles,
  ArrowRight,
  Package,
  Clock,
  Star,
  Info,
  Chrome,
  Apple,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function DownloadAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed after page load
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: '🎉 Successfully Installed!',
        description: 'Thank you for installing RKR Laundry! You can now access it from your home screen for quick and easy laundry services.',
        duration: 6000,
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        variant: 'destructive',
        title: 'Installation Not Available',
        description: 'Your browser does not support app installation, or the app is already installed.',
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: '🎉 Installation Started!',
        description: 'RKR Laundry is being added to your device. You\'ll be able to access it from your home screen shortly!',
        duration: 5000,
      });
    } else {
      toast({
        title: 'Installation Cancelled',
        description: 'No worries! You can install the app anytime from your browser menu or try again later.',
      });
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    { icon: Zap, title: 'Fast Access', description: 'Launch instantly from your home screen' },
    { icon: Bell, title: 'Notifications', description: 'Get real-time order updates' },
    { icon: Shield, title: 'Secure', description: 'Safe and encrypted transactions' },
    { icon: Package, title: 'Order Tracking', description: 'Monitor your laundry status' },
    { icon: Clock, title: 'Offline Ready', description: 'Works even without internet' },
    { icon: Star, title: 'Better Experience', description: 'Optimized for mobile devices' },
  ];

  const getDeviceInstructions = () => {
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    if (isIOS) {
      return {
        icon: Apple,
        title: 'Install on iOS',
        steps: [
          'Tap the Share button at the bottom of Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm installation',
        ],
      };
    } else if (isAndroid) {
      return {
        icon: Chrome,
        title: 'Install on Android',
        steps: [
          'Tap the menu (three dots) in Chrome',
          'Select "Install app" or "Add to Home screen"',
          'Confirm installation when prompted',
        ],
      };
    } else {
      return {
        icon: Monitor,
        title: 'Install on Desktop',
        steps: [
          'Click the install icon in your browser address bar',
          'Or go to browser menu → "Install RKR Laundry"',
          'Follow the installation prompts',
        ],
      };
    }
  };

  const instructions = getDeviceInstructions();
  const InstructionIcon = instructions.icon;

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Download RKR Laundry App
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Install our app for a faster, more convenient laundry experience. Access all features with just one tap!
              </p>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">Get the App</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Free to install • No app store required
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isInstalled ? (
                  /* Installed State */
                  <div className="text-center space-y-6 py-8">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                        <div className="relative p-6 rounded-full bg-green-500/10 border-4 border-green-500/30">
                          <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        🎉 Successfully Installed!
                      </h2>
                      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Thank you for installing <strong className="text-foreground">RKR Laundry</strong>! 
                        The app is now available on your device.
                      </p>
                    </div>
                    
                    <Card className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50 dark:border-green-800/50">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                            What's Next?
                          </h3>
                          <ul className="space-y-2 text-sm text-muted-foreground text-left max-w-md mx-auto">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>Find the RKR Laundry icon on your home screen or app drawer</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>Tap to launch and enjoy faster access to all features</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>Get push notifications for order updates and promotions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>Works offline - access your orders even without internet</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Link href="/create-order">
                        <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto">
                          <Package className="mr-2 h-5 w-5" />
                          Create Your First Order
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/order-status">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 h-auto border-2">
                          Track Orders
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : isInstallable ? (
                  /* Installable State */
                  <div className="space-y-6">
                    <div className="text-center space-y-4 py-4">
                      <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/10 border-4 border-primary/20">
                          <Smartphone className="h-16 w-16 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Ready to Install!
                        </h2>
                        <p className="text-base text-muted-foreground max-w-xl mx-auto">
                          Click the button below to add <strong className="text-foreground">RKR Laundry</strong> to your device. 
                          It only takes a few seconds and you'll have instant access to all our services!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={handleInstallClick}
                        className="h-16 w-full sm:w-auto min-w-[280px] text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                      >
                        <Download className="mr-3 h-6 w-6" />
                        Install RKR Laundry App
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </Button>
                    </div>

                    <Separator />

                    {/* Features Grid */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Why Install Our App?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-all bg-gradient-to-br from-muted/30 to-muted/10">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Not Installable State */
                  <div className="space-y-6">
                    <div className="text-center space-y-4 py-4">
                      <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-muted border-4 border-border">
                          <Info className="h-16 w-16 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Manual Installation
                        </h2>
                        <p className="text-base text-muted-foreground max-w-xl mx-auto">
                          Your browser doesn't support automatic installation, but you can still add RKR Laundry to your device manually. 
                          Follow the instructions below for your device.
                        </p>
                      </div>
                    </div>

                    <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <InstructionIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <CardTitle className="text-xl">{instructions.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-3">
                          {instructions.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full p-0 flex items-center justify-center font-bold">
                                {index + 1}
                              </Badge>
                              <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    <Separator />

                    {/* Features Grid */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">App Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-all bg-gradient-to-br from-muted/30 to-muted/10">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            {!isInstalled && (
              <Card className="shadow-lg border-2 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50 dark:border-amber-800/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
                      <Info className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg text-foreground">About the App</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        RKR Laundry is a Progressive Web App (PWA) that works like a native app. 
                        It's free to install, doesn't require an app store, and takes up minimal storage space. 
                        Once installed, you'll have quick access to order tracking, creating new orders, and all our services right from your home screen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
