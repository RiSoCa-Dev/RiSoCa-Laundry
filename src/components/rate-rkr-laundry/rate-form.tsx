'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingStars } from './rating-stars';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitOrderRating, type OrderRatingInsert } from '@/lib/api/ratings';

interface RateFormProps {
  orderId: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function RateForm({ orderId, onSubmitSuccess, onCancel }: RateFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = rating > 0 && customerName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      if (rating === 0) {
        toast({
          variant: 'destructive',
          title: 'Rating Required',
          description: 'Please select a rating.',
        });
      } else if (customerName.trim().length === 0) {
        toast({
          variant: 'destructive',
          title: 'Name Required',
          description: 'Please enter your name.',
        });
      }
      return;
    }

    setIsSubmitting(true);

    const ratingData: OrderRatingInsert = {
      order_id: orderId,
      customer_name: customerName.trim(),
      contact_number: contactNumber.trim() || null,
      overall_rating: rating,
      feedback_message: feedbackMessage.trim() || null,
    };

    const { error } = await submitOrderRating(ratingData);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'Failed to submit rating. Please try again.',
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Thank You!',
      description: 'Your rating has been submitted successfully.',
    });

    onSubmitSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-base font-semibold">
          Overall Rating *
        </Label>
        <RatingStars rating={rating} onRatingChange={setRating} />
        <p className="text-xs text-muted-foreground">(Click stars to rate)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName" className="text-base font-semibold">
          Your Name *
        </Label>
        <Input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter your name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedbackMessage" className="text-base font-semibold">
          Your Feedback (optional)
        </Label>
        <Textarea
          id="feedbackMessage"
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={4}
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber" className="text-base font-semibold">
          Contact Number (optional)
        </Label>
        <Input
          id="contactNumber"
          type="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="09123456789"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Rating'
          )}
        </Button>
      </div>
    </form>
  );
}
