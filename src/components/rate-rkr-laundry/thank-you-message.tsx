'use client';

import { RatingStars } from './rating-stars';
import { CheckCircle2 } from 'lucide-react';

interface ThankYouMessageProps {
  rating: number;
}

export function ThankYouMessage({ rating }: ThankYouMessageProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        <h3 className="text-xl font-semibold">Thank You!</h3>
      </div>
      
      <p className="text-base text-muted-foreground">
        We appreciate your feedback!
      </p>

      <div className="flex justify-center py-2">
        <RatingStars rating={rating} readonly size="lg" />
      </div>

      <p className="text-sm text-muted-foreground">
        Your rating helps us improve our service. Thank you for choosing RKR Laundry!
      </p>
    </div>
  );
}
