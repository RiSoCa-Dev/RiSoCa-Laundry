'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { RateForm } from './rate-form';
import { ThankYouMessage } from './thank-you-message';
import { getOrderRating, type OrderRating } from '@/lib/api/ratings';

interface RateRKRLaundrySectionProps {
  orderId: string;
}

export function RateRKRLaundrySection({ orderId }: RateRKRLaundrySectionProps) {
  const [rating, setRating] = useState<OrderRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    async function fetchRating() {
      setLoading(true);
      const { data, error } = await getOrderRating(orderId);
      
      if (!error && data) {
        setRating(data);
        setShowForm(false);
      } else {
        // Show form if no rating exists (reset cancelled state on mount)
        setIsCancelled(false);
        setShowForm(true);
      }
      setLoading(false);
    }

    fetchRating();
  }, [orderId]);

  const handleSubmitSuccess = () => {
    // Refetch rating after submission
    getOrderRating(orderId).then(({ data, error }) => {
      if (!error && data) {
        setRating(data);
        setShowForm(false);
      }
    });
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If rating exists, always show thank you message
  if (rating) {
    return (
      <Card>
        <CardContent className="py-6">
          <ThankYouMessage rating={rating.overall_rating} />
        </CardContent>
      </Card>
    );
  }

  // If form was cancelled, don't show anything
  if (isCancelled) {
    return null;
  }

  // Show form if no rating exists and not cancelled
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Rate RKR Laundry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-base text-muted-foreground">
            How was your experience with RKR Laundry?
          </p>
        </div>
        <RateForm
          orderId={orderId}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
}
