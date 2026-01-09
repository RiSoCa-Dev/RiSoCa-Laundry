import type { Order } from '@/components/order-list/types';
import {
  createOrderWithHistory,
  fetchLatestOrderId,
  generateNextOrderId,
} from '@/lib/api/orders';

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

export async function handleOrderCreation(
  newOrder: Omit<Order, 'id' | 'userId'>,
  userId: string | undefined,
  toast: (options: {
    variant?: 'default' | 'destructive';
    title: string;
    description?: string;
  }) => void,
  fetchOrders: () => Promise<void>
): Promise<CreateOrderResult> {
  // Admin/Employee orders get RKR ID immediately with "Order Placed" status
  const { latestId, error: idError } = await fetchLatestOrderId();

  if (idError) {
    toast({
      variant: 'default',
      title: 'Please try again',
      description:
        'Unable to generate order ID. Please refresh the page and try creating the order again.',
    });
    return { success: false, error: 'Failed to generate order ID' };
  }

  const newOrderId = generateNextOrderId(latestId);
  const initialStatus = 'Order Placed';

  const { error } = await createOrderWithHistory({
    id: newOrderId,
    customer_id: userId ?? 'admin-manual',
    customer_name: newOrder.customerName,
    contact_number: newOrder.contactNumber,
    service_package: newOrder.servicePackage as any,
    weight: newOrder.weight,
    loads: newOrder.load,
    distance: newOrder.distance,
    delivery_option: newOrder.deliveryOption,
    status: initialStatus,
    total: newOrder.total,
    is_paid: newOrder.isPaid,
    order_type: newOrder.orderType || 'customer',
    // Normalize employee assignments - use assigned_employee_ids as source of truth
    assigned_employee_ids:
      newOrder.assignedEmployeeIds && newOrder.assignedEmployeeIds.length > 0
        ? newOrder.assignedEmployeeIds
        : undefined,
    assigned_employee_id:
      newOrder.assignedEmployeeIds && newOrder.assignedEmployeeIds.length > 0
        ? newOrder.assignedEmployeeIds[0] // First employee for backward compatibility
        : newOrder.assignedEmployeeId || undefined, // Fallback to single assignment
    created_at: newOrder.orderDate.toISOString(), // Use the custom order date
  });

  if (error) {
    // Handle duplicate ID error (race condition) - retry with fresh ID fetch
    const isDuplicateError =
      error.code === '23505' ||
      error.message?.includes('duplicate') ||
      error.message?.includes('unique');

    if (isDuplicateError) {
      // Retry with a fresh ID fetch
      const { latestId: retryLatestId, error: retryIdError } =
        await fetchLatestOrderId();

      if (retryIdError) {
        toast({
          variant: 'default',
          title: 'Please refresh and try again',
          description:
            'Unable to generate order ID. Please refresh the page and try creating the order again.',
        });
        return { success: false, error: 'Failed to generate retry order ID' };
      }

      const retryOrderId = generateNextOrderId(retryLatestId);
      const { error: retryCreateError } = await createOrderWithHistory({
        id: retryOrderId,
        customer_id: userId ?? 'admin-manual',
        customer_name: newOrder.customerName,
        contact_number: newOrder.contactNumber,
        service_package: newOrder.servicePackage as any,
        weight: newOrder.weight,
        loads: newOrder.load,
        distance: newOrder.distance,
        delivery_option: newOrder.deliveryOption,
        status: initialStatus,
        total: newOrder.total,
        is_paid: newOrder.isPaid,
        order_type: newOrder.orderType || 'customer',
        // Normalize employee assignments - use assigned_employee_ids as source of truth
        assigned_employee_ids:
          newOrder.assignedEmployeeIds &&
          newOrder.assignedEmployeeIds.length > 0
            ? newOrder.assignedEmployeeIds
            : undefined,
        assigned_employee_id:
          newOrder.assignedEmployeeIds &&
          newOrder.assignedEmployeeIds.length > 0
            ? newOrder.assignedEmployeeIds[0] // First employee for backward compatibility
            : newOrder.assignedEmployeeId || undefined, // Fallback to single assignment
        created_at: newOrder.orderDate.toISOString(), // Use the custom order date
      });

      if (retryCreateError) {
        toast({
          variant: 'default',
          title: 'Please refresh and try again',
          description:
            'The order may have been created. Please refresh the page to check.',
        });
        return { success: false, error: 'Failed to create order on retry' };
      }

      toast({
        title: 'Order Placed',
        description: `New order #${retryOrderId} for ${newOrder.customerName} has been created.`,
      });
      await fetchOrders();
      return { success: true, orderId: retryOrderId };
    }

    toast({
      variant: 'default',
      title: 'Please refresh and try again',
      description:
        'Unable to create order. Please refresh the page and try again.',
    });
    return { success: false, error: error.message || 'Failed to create order' };
  }

  toast({
    title: 'Order Placed',
    description: `New order #${newOrderId} for ${newOrder.customerName} has been created.`,
  });
  await fetchOrders();
  return { success: true, orderId: newOrderId };
}
