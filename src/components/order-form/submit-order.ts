import { createOrderWithHistory, generateTemporaryOrderId, countCustomerOrdersToday } from '@/lib/api/orders';
import type { Order } from '@/components/order-list';
import { PendingOrder, CustomerFormValues } from './types';
import type { User } from '@supabase/supabase-js';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Toast } from '@/hooks/use-toast';

/**
 * Handles order submission after customer info is collected.
 */
export async function submitOrder(
  pendingOrder: PendingOrder,
  customerData: CustomerFormValues,
  user: User,
  router: AppRouterInstance,
  toast: (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void,
  setOrderCount: (count: number | null) => void,
  setIsCustomerInfoDialogOpen: (open: boolean) => void,
  customerFormReset: () => void,
  formReset: () => void
): Promise<void> {
  // Check daily order limit (5 orders per day, including canceled)
  const currentOrderCount = await countCustomerOrdersToday(user.id);
  setOrderCount(currentOrderCount);
  if (currentOrderCount >= 5) {
    toast({
      variant: 'destructive',
      title: 'Daily Order Limit Reached',
      description: "You've reached the maximum of 5 orders today. Please try again tomorrow. If you need to place more orders, please contact us or give us a call.",
    });
    setIsCustomerInfoDialogOpen(false);
    router.push('/contact-us');
    return;
  }

  // Generate temporary ID - will be replaced with RKR format when status changes to "Order Placed"
  const tempOrderId = await generateTemporaryOrderId();
  const initialStatus = 'Order Created';

  const newOrder: Order = {
    id: tempOrderId,
    userId: user.id,
    customerName: customerData.customerName,
    contactNumber: customerData.contactNumber,
    load: pendingOrder.loads,
    weight: pendingOrder.orderData.weight || 7.5,
    status: initialStatus,
    total: pendingOrder.pricing.computedPrice,
    orderDate: new Date(),
    isPaid: false,
    servicePackage: pendingOrder.orderData.servicePackage,
    distance: pendingOrder.orderData.distance ?? 0,
    deliveryOption: customerData.deliveryOption,
    statusHistory: [{ status: initialStatus, timestamp: new Date() }],
  };

  const { error } = await createOrderWithHistory({
    id: tempOrderId,
    customer_id: user.id,
    customer_name: newOrder.customerName,
    contact_number: newOrder.contactNumber,
    service_package: pendingOrder.orderData.servicePackage as 'package1' | 'package2' | 'package3',
    weight: newOrder.weight,
    loads: newOrder.load,
    distance: newOrder.distance,
    delivery_option: newOrder.deliveryOption,
    status: initialStatus,
    total: newOrder.total,
    is_paid: newOrder.isPaid,
  });

  if (error) {
    // Handle duplicate ID error (race condition) - retry with new temp ID
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
      const retryTempId = await generateTemporaryOrderId();
      const { error: retryCreateError } = await createOrderWithHistory({
        id: retryTempId,
        customer_id: user.id,
        customer_name: newOrder.customerName,
        contact_number: newOrder.contactNumber,
        service_package: pendingOrder.orderData.servicePackage as 'package1' | 'package2' | 'package3',
        weight: newOrder.weight,
        loads: newOrder.load,
        distance: newOrder.distance,
        delivery_option: newOrder.deliveryOption,
        status: initialStatus,
        total: newOrder.total,
        is_paid: newOrder.isPaid,
      });
      if (retryCreateError) {
        console.error("Failed to save order to Supabase (retry)", retryCreateError);
        toast({
          variant: "destructive",
          title: 'Save Error!',
          description: `Could not save your order. Please try again.`
        });
        return;
      }
      toast({
        title: 'Order Created!',
        description: `Your order has been created. Please wait for approval. Your laundry must first arrive at the shop before this order can be processed.`
      });
      // Optimistically update order count
      setOrderCount(prev => (prev !== null ? prev + 1 : 1));
      setTimeout(async () => {
        const newCount = await countCustomerOrdersToday(user.id);
        setOrderCount(newCount);
      }, 500);
      setIsCustomerInfoDialogOpen(false);
      customerFormReset();
      formReset();
      router.push('/order-status');
      return;
    }
    console.error("Failed to save order to Supabase", error);
    toast({
      variant: "destructive",
      title: 'Save Error!',
      description: `Could not save your order. Please try again.`
    });
    return;
  }
  
  toast({
    title: 'Order Created!',
    description: `Your order has been created. Please wait for approval. Your laundry must first arrive at the shop before this order can be processed.`
  });

  // Optimistically update order count (increment by 1)
  // Then refresh from server to ensure accuracy
  setOrderCount(prev => (prev !== null ? prev + 1 : 1));
  
  // Refresh order count from server after a short delay to ensure DB consistency
  setTimeout(async () => {
    const newCount = await countCustomerOrdersToday(user.id);
    setOrderCount(newCount);
  }, 500);

  setIsCustomerInfoDialogOpen(false);
  customerFormReset();
  formReset();
  
  router.push('/order-status');
}
