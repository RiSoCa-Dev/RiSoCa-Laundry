'use client';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingsList } from '@/components/ratings-list';

export default function CustomerRatingsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 flex items-start justify-center min-h-full">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Customer Ratings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View customer reviews and ratings. Click on a rating to see full details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RatingsList />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

