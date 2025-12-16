'use client';

import { PromoProvider } from '@/contexts/promo-context';

export function PromoProviderWrapper({ children }: { children: React.ReactNode }) {
  return <PromoProvider>{children}</PromoProvider>;
}

