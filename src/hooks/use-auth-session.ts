import { useEffect, useState, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // First, get the current session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      initializedRef.current = true;
      setLoading(false);
    });

    // Then subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      // Only set loading to false if we've already initialized
      // This prevents race conditions where onAuthStateChange fires before getSession completes
      if (initializedRef.current) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  return { session, loading, user: session?.user ?? null };
}

