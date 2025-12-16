import { supabase } from './supabase-client';

const ROLE_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
const ROLE_CACHE_KEY_PREFIX = 'user_role_';

interface CachedRole {
  role: string;
  timestamp: number;
}

function getCachedRole(userId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`${ROLE_CACHE_KEY_PREFIX}${userId}`);
    if (!cached) return null;
    
    const { role, timestamp }: CachedRole = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired (older than 1 hour)
    if (now - timestamp > ROLE_CACHE_EXPIRY) {
      localStorage.removeItem(`${ROLE_CACHE_KEY_PREFIX}${userId}`);
      return null;
    }
    
    return role;
  } catch {
    return null;
  }
}

function setCachedRole(userId: string, role: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached: CachedRole = {
      role,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${ROLE_CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearRoleCache(userId?: string): void {
  if (typeof window === 'undefined') return;
  
  if (userId) {
    localStorage.removeItem(`${ROLE_CACHE_KEY_PREFIX}${userId}`);
  } else {
    // Clear all role caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(ROLE_CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  // Check cache first
  const cachedRole = getCachedRole(userId);
  if (cachedRole) {
    return cachedRole;
  }
  
  // Fetch from database
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  
  const role = data.role || 'customer';
  
  // Cache the result
  setCachedRole(userId, role);
  
  return role;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function isEmployee(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'employee';
}

