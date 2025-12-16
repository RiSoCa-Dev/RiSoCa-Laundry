import type { Order } from '@/components/order-list';

const ORDER_CACHE_KEY_PREFIX = 'cached_orders_';
const MAX_CACHED_ORDERS = 10;
const ORDER_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CachedOrders {
  orders: Order[];
  timestamp: number;
  userId: string;
}

export function getCachedOrders(userId: string): Order[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`${ORDER_CACHE_KEY_PREFIX}${userId}`);
    if (!cached) return null;
    
    const { orders, timestamp, userId: cachedUserId }: CachedOrders = JSON.parse(cached);
    
    // Check if cache is for different user
    if (cachedUserId !== userId) {
      localStorage.removeItem(`${ORDER_CACHE_KEY_PREFIX}${userId}`);
      return null;
    }
    
    // Check if cache is expired (older than 5 minutes)
    const now = Date.now();
    if (now - timestamp > ORDER_CACHE_EXPIRY) {
      localStorage.removeItem(`${ORDER_CACHE_KEY_PREFIX}${userId}`);
      return null;
    }
    
    // Parse dates back from strings
    return orders.map(order => ({
      ...order,
      orderDate: new Date(order.orderDate),
      statusHistory: order.statusHistory.map(sh => ({
        ...sh,
        timestamp: new Date(sh.timestamp),
      })),
    }));
  } catch {
    return null;
  }
}

export function setCachedOrders(userId: string, orders: Order[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Only cache the most recent orders (up to MAX_CACHED_ORDERS)
    const ordersToCache = orders.slice(0, MAX_CACHED_ORDERS);
    
    const cached: CachedOrders = {
      orders: ordersToCache,
      timestamp: Date.now(),
      userId,
    };
    
    localStorage.setItem(`${ORDER_CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearOrderCache(userId?: string): void {
  if (typeof window === 'undefined') return;
  
  if (userId) {
    localStorage.removeItem(`${ORDER_CACHE_KEY_PREFIX}${userId}`);
  } else {
    // Clear all order caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(ORDER_CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

