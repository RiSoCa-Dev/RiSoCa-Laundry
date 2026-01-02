import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';

type Employee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

// Global cache for employees
let employeeCache: Employee[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let subscriptionChannel: ReturnType<typeof supabase.channel> | null = null;
let subscribersCount = 0;

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(employeeCache || []);
  const [loading, setLoading] = useState(!employeeCache);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // If we have valid cached data, use it immediately
    const now = Date.now();
    if (employeeCache && (now - cacheTimestamp) < CACHE_DURATION) {
      setEmployees(employeeCache);
      setLoading(false);
    } else {
      // Cache is stale or doesn't exist, fetch fresh data
      fetchEmployees();
    }

    // Set up real-time subscription (only once globally)
    if (!subscriptionChannel) {
      subscriptionChannel = supabase
        .channel('employees-global-cache')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: 'role=eq.employee'
          },
          () => {
            // Invalidate cache and refresh
            employeeCache = null;
            cacheTimestamp = 0;
            fetchEmployees();
          }
        )
        .subscribe();
    }
    subscribersCount++;

    return () => {
      isMountedRef.current = false;
      subscribersCount--;
      
      // Only unsubscribe if no more subscribers
      if (subscribersCount === 0 && subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
        subscriptionChannel = null;
      }
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'employee')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching employees', error);
        if (isMountedRef.current) {
          setEmployees([]);
          setLoading(false);
        }
        return;
      }

      const employeeData = data || [];
      
      // Update global cache
      employeeCache = employeeData;
      cacheTimestamp = Date.now();

      // Update all subscribers
      if (isMountedRef.current) {
        setEmployees(employeeData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching employees', error);
      if (isMountedRef.current) {
        setEmployees([]);
        setLoading(false);
      }
    }
  };

  return { employees, loading, refetch: fetchEmployees };
}

// Function to manually invalidate cache (useful for admin actions)
export function invalidateEmployeeCache() {
  employeeCache = null;
  cacheTimestamp = 0;
}

