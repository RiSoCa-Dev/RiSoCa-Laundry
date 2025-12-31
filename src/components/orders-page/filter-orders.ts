import { startOfDay } from 'date-fns';
import type { Order } from '@/components/order-list/types';

export function filterOrders(
  allOrders: Order[],
  searchQuery: string,
  statusFilter: string,
  paymentFilter: string,
  datePreset: string
): Order[] {
  let filtered = [...allOrders];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.contactNumber.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter !== 'all') {
    if (statusFilter === 'active') {
      filtered = filtered.filter(
        (o) =>
          o.status !== 'Success' &&
          o.status !== 'Completed' &&
          o.status !== 'Delivered' &&
          o.status !== 'Canceled'
      );
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(
        (o) =>
          o.status === 'Success' ||
          o.status === 'Completed' ||
          o.status === 'Delivered'
      );
    } else {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
  }

  // Payment filter
  if (paymentFilter === 'paid') {
    filtered = filtered.filter((o) => o.isPaid);
  } else if (paymentFilter === 'unpaid') {
    filtered = filtered.filter((o) => !o.isPaid);
  } else if (paymentFilter === 'partial') {
    filtered = filtered.filter(
      (o) => !o.isPaid && o.balance && o.balance > 0 && o.balance < o.total
    );
  }

  // Date filter
  if (datePreset === 'all') {
    // Show all orders - no filtering
  } else if (datePreset === 'today') {
    const today = startOfDay(new Date());
    filtered = filtered.filter(
      (o) => startOfDay(o.orderDate).getTime() === today.getTime()
    );
  }

  // Sort by order number (extract numeric part from order ID) - latest first
  filtered.sort((a, b) => {
    const getOrderNum = (id: string) => {
      const match = id.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    };
    const numA = getOrderNum(a.id);
    const numB = getOrderNum(b.id);
    if (numA !== numB) {
      return numB - numA; // Descending (latest first)
    }
    // If no numeric part, sort alphabetically (descending)
    return b.id.localeCompare(a.id);
  });

  return filtered;
}
