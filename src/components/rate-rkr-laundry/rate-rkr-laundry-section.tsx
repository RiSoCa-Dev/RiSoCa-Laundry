'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchRating() {
      setLoading(true);
      const { data, error } = await getOrderRating(orderId);
      
      if (!error && data) {
        setRating(data);
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
        setIsDialogOpen(false);
      }
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  // If rating exists, show thank you message
  if (rating) {
    return <ThankYouMessage rating={rating.overall_rating} />;
  }

  // Show button that opens dialog
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="w-full"
      >
        <span className="text-lg mr-2">⭐</span>
        Rate RKR Laundry
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Rate RKR Laundry
            </DialogTitle>
            <DialogDescription>
              How was your experience with RKR Laundry?
            </DialogDescription>
          </DialogHeader>
          <RateForm
            orderId={orderId}
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
