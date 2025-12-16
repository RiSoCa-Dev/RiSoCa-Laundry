'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getActivePromo, type Promo } from '@/lib/api/promos';

interface PromoContextType {
  promo: Promo | null;
  loading: boolean;
}

const PromoContext = createContext<PromoContextType>({
  promo: null,
  loading: true,
});

export function PromoProvider({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromo = async () => {
      const { data } = await getActivePromo();
      setPromo(data);
      setLoading(false);
    };

    // Initial fetch
    fetchPromo();
    
    // Refresh every 10 minutes (600000ms)
    const interval = setInterval(fetchPromo, 600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PromoContext.Provider value={{ promo, loading }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  return useContext(PromoContext);
}

