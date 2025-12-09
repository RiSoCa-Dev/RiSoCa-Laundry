'use client';

import Link from 'next/link';
import { Download, Gift, Megaphone, WashingMachine } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
    const pathname = usePathname();
    const isHome = pathname === '/';

  return (
    <header className="w-full border-b bg-gradient-to-r from-purple-50 via-background to-purple-50">
      <div className="container flex h-16 items-center justify-between px-4 gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2">
          <WashingMachine className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          <div className='flex flex-col'>
              <span className="font-bold text-primary text-lg sm:text-xl leading-none">RKR Laundry</span>
              <span className="text-xs sm:text-sm text-muted-foreground leading-none mt-1">Fast. Clean. Convenient.</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 flex-1 justify-end flex-wrap">
          {isHome && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm",
                "text-sm sm:text-base"
              )}
              style={{
                background: 'linear-gradient(90deg, #ede9fe 0%, #e0e7ff 100%)',
              }}
            >
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700" />
              <span className="text-xs sm:text-sm text-purple-900 font-medium flex items-center gap-1">
                🎉 Special Offer! <strong>December 17, 2025</strong> — Only <strong>₱150 per load</strong>! 🎉
              </span>
            </div>
          )}

          <nav className="flex items-center gap-3 flex-wrap text-sm font-medium">
            <Link
              href="/download-app"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Megaphone className="h-4 w-4" />
              Download App (APK – Coming Soon)
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
