'use client';

import { useState, useTransition } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateFeatureDescription } from '@/ai/flows/feature-description-generation';

const initialFeatures = [
  { 
    title: 'Customer Authentication', 
    description: 'Secure registration and login system for customers.' 
  },
  { 
    title: 'Order Creation & Pricing', 
    description: 'Intuitive form to create orders with dynamic price calculation based on weight and distance.' 
  },
  { 
    title: 'Real-Time Order Tracking', 
    description: 'Track the status of your laundry from pickup to delivery in real-time.' 
  },
  { 
    title: 'Admin Dashboard', 
    description: 'A comprehensive dashboard for business owners to manage orders, rates, and employees.' 
  },
  { 
    title: 'Employee Salary Management', 
    description: 'Automated salary calculation for employees based on completed laundry loads.' 
  },
  { 
    title: 'Expense Tracking', 
    description: 'A simple tool for administrators to log and monitor business expenses.' 
  },
];

type Feature = {
  title: string;
  description: string;
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    setIsGenerating(true);
    startTransition(async () => {
      const newDescriptions = await Promise.all(
        initialFeatures.map(feature => 
          generateFeatureDescription({ featureName: feature.title })
        )
      );

      const updatedFeatures = initialFeatures.map((feature, index) => ({
        ...feature,
        description: newDescriptions[index].description,
      }));

      setFeatures(updatedFeatures);
      setIsGenerating(false);
    });
  };

  return (
    <div className="dark bg-background text-foreground flex flex-col min-h-screen">
      <AppHeader showLogo={true} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">RKR Laundry</h1>
          <p className="text-lg text-muted-foreground mt-2">The future of laundry management.</p>
          <div className="mt-6">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="h-24">
                  {isPending && features[index].description === initialFeatures[index].description ? (
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                     </div>
                  ) : (
                    <p className="text-muted-foreground">{feature.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
