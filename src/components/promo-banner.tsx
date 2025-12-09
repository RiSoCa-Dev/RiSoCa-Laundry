'use client';

import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PromoBanner() {
  return (
    <div className="w-full border-b bg-background/95">
      <div className="container flex items-center justify-center px-4 py-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-2 sm:px-3 py-1.5 shadow-sm",
            "text-xs sm:text-sm w-full max-w-4xl"
          )}
          style={{
            background: 'linear-gradient(90deg, #ede9fe 0%, #e0e7ff 100%)',
          }}
        >
          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700 flex-shrink-0" />
          <span className="text-purple-900 font-medium text-center flex items-center gap-1 flex-wrap justify-center min-w-0">
            🎉 Special Offer! <strong>December 17, 2025</strong> — Only <strong>₱150 per load</strong>! 🎉
          </span>
        </div>
      </div>
    </div>
  );
}

