
'use client';
import { Suspense } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { OrderForm } from '@/components/order-form';
import { Loader2 } from 'lucide-react';

function CreateOrderForm() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
          <AppHeader />
          <PromoBanner />
          <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-2 sm:py-4 pb-14 overflow-hidden min-h-0">
            <div className="w-full max-w-2xl h-full max-h-full flex items-stretch">
              <OrderForm />
            </div>
          </main>
          <AppFooter />
        </div>
    )
}

export default function CreateOrderPage() {
  return (
      <Suspense fallback={<div className="h-screen w-screen bg-muted flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <CreateOrderForm />
      </Suspense>
  );
}
