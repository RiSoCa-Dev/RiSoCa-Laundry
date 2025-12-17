'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { getAverageRating } from '@/lib/api/ratings';

export function AverageRatingCard() {
  const router = useRouter();
  const [average, setAverage] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAverage() {
      setLoading(true);
      const { average: avg, count: cnt } = await getAverageRating();
      setAverage(avg);
      setCount(cnt);
      setLoading(false);
    }

    loadAverage();
  }, []);

  const handleClick = () => {
    router.push('/customer-ratings');
  };

  if (loading) {
    return (
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (count === 0) {
    return (
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-lg font-semibold">No ratings yet</p>
            </div>
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const fullStars = Math.floor(average);
  const hasHalfStar = average % 1 >= 0.5;

  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= fullStars
                        ? 'fill-yellow-400 text-yellow-400'
                        : star === fullStars + 1 && hasHalfStar
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{average.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({count} {count === 1 ? 'rating' : 'ratings'})</span>
            </div>
          </div>
          <Star className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

