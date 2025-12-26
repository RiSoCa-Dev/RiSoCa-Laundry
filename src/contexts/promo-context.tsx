'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getActivePromo, type Promo } from '@/lib/api/promos';

interface PromoContextType {
  promo: Promo | null;
  loading: boolean;
  refreshPromo: () => Promise<void>;
}

const PromoContext = createContext<PromoContextType>({
  promo: null,
  loading: true,
  refreshPromo: async () => {},
});

export function PromoProvider({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPromo = async () => {
    setLoading(true);
    try {
      const { data } = await getActivePromo();
      setPromo(data);
    } catch (error) {
      console.error('Error fetching promo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only - no automatic refresh
    fetchPromo();
  }, []);

  return (
    <PromoContext.Provider value={{ promo, loading, refreshPromo: fetchPromo }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  return useContext(PromoContext);
}

