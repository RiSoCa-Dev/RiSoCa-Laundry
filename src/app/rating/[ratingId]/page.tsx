'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Heart, ArrowLeft, Inbox } from 'lucide-react';
import { fetchRatingDetails, toggleRatingLike, type RatingWithOrder } from '@/lib/api/ratings';
import { maskName } from '@/lib/utils/name-mask';
import { format } from 'date-fns';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useToast } from '@/hooks/use-toast';

export default function RatingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthSession();
  const { toast } = useToast();
  const ratingId = params.ratingId as string;
  
  const [rating, setRating] = useState<RatingWithOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    async function loadRating() {
      if (!ratingId) return;
      
      setLoading(true);
      const { data, error } = await fetchRatingDetails(ratingId, user?.id);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load rating details.',
        });
        setLoading(false);
        return;
      }

      setRating(data);
      setLoading(false);
    }

    loadRating();
  }, [ratingId, user?.id, toast]);

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to like ratings.',
      });
      return;
    }

    if (!rating) return;

    setLiking(true);
    const { data, error } = await toggleRatingLike(rating.id, user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update like.',
      });
      setLiking(false);
      return;
    }

    // Update rating state
    setRating(prev => prev ? {
      ...prev,
      like_count: data?.liked 
        ? (prev.like_count || 0) + 1 
        : Math.max(0, (prev.like_count || 0) - 1),
      user_has_liked: data?.liked || false,
    } : null);

    setLiking(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader />
        <PromoBanner />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading rating details...</p>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader />
        <PromoBanner />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-full">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Rating Not Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The rating you're looking for doesn't exist.
                </p>
                <Button onClick={() => router.push('/order-status')} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Ratings
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const maskedName = maskName(rating.customer_name);
  const initial = maskedName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-full">
          <div className="w-full max-w-2xl space-y-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/order-status')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ratings
            </Button>

            {/* Rating Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  {/* Profile Icon */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-2xl">
                      {initial}
                    </span>
                  </div>

                  {/* Name and Date */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{maskedName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(rating.created_at), 'yyyy-MM-dd')}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= rating.overall_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({rating.overall_rating}/5)
                    </span>
                  </div>
                </div>

                {/* Load and Weight */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Load:</span>
                    <span className="text-sm text-muted-foreground">
                      {rating.order?.loads || 0} {rating.order?.loads === 1 ? 'load' : 'loads'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Weight:</span>
                    <span className="text-sm text-muted-foreground">
                      {rating.order?.weight || 0} kg
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Feedback:</h4>
                  {rating.feedback_message ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                      {rating.feedback_message}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No feedback provided.</p>
                  )}
                </div>

                {/* Like Section */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant={rating.user_has_liked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    disabled={liking || !user}
                    className="gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        rating.user_has_liked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    {liking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <span>{rating.like_count || 0}</span>
                    )}
                  </Button>
                  {!user && (
                    <p className="text-xs text-muted-foreground">
                      Log in to like this rating
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

