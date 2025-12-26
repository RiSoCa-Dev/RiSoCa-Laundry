import { supabase } from './supabase-client';

const EMPLOYEE_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const EMPLOYEE_CACHE_KEY = 'cached_employees';

type Employee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

interface CachedEmployees {
  employees: Employee[];
  timestamp: number;
}

function getCachedEmployees(): Employee[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(EMPLOYEE_CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedEmployees = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - parsed.timestamp < EMPLOYEE_CACHE_EXPIRY) {
      return parsed.employees;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(EMPLOYEE_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading employee cache:', error);
    return null;
  }
}

function setCachedEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache: CachedEmployees = {
      employees,
      timestamp: Date.now(),
    };
    localStorage.setItem(EMPLOYEE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting employee cache:', error);
  }
}

export async function fetchEmployeesWithCache(): Promise<Employee[]> {
  // Try to get from cache first
  const cached = getCachedEmployees();
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'employee')
    .order('first_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching employees', error);
    return [];
  }
  
  const employees = data || [];
  
  // Cache the result
  setCachedEmployees(employees);
  
  return employees;
}

export function clearEmployeeCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EMPLOYEE_CACHE_KEY);
}

export type { Employee };

