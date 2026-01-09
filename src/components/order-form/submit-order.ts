import { useState } from 'react';
import { createOrderWithHistory, generateTemporaryOrderId, countCustomerOrdersToday } from '@/lib/api/orders';
import type { Order } from '@/components/order-list';
import { PendingOrder, CustomerFormValues } from './types';
import type { User } from '@supabase/supabase-js';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useSubmitOrder(
  router: AppRouterInstance,
  toast: (props: ToastProps) => void
) {
  // Track order count
  const [orderCount, setOrderCount] = useState<number | null>(null);

  async function submitOrder(
    pendingOrder: PendingOrder,
    customerData: CustomerFormValues,
    user: User,
    setIsCustomerInfoDialogOpen: (open: boolean) => void,
    customerFormReset: () => void,
    formReset: () => void
  ): Promise<void> {
    try {
      // Check daily order limit (5 orders per day)
      const currentOrderCount = await countCustomerOrdersToday(user.id);
      setOrderCount(currentOrderCount);

      if (currentOrderCount >= 5) {
        toast({
          variant: 'destructive',
          title: 'Daily Order Limit Reached',
          description: "You've reached the maximum of 5 orders today. Please try again tomorrow or contact us if you need more.",
        });
        setIsCustomerInfoDialogOpen(false);
        router.push('/contact-us');
        return;
      }

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

      const saveOrder = async (orderId: string): Promise<boolean> => {
        const { error } = await createOrderWithHistory({
          id: orderId,
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
        return !error;
      };

      let saved = await saveOrder(tempOrderId);

      // Retry if duplicate ID error
      if (!saved) {
        const retryTempId = await generateTemporaryOrderId();
        saved = await saveOrder(retryTempId);

        if (!saved) {
          toast({
            variant: 'destructive',
            title: 'Save Error!',
            description: 'Could not save your order. Please try again.',
          });
          return;
        }
      }

      toast({
        title: 'Order Created!',
        description: 'Your order has been created. Please wait for approval. Your laundry must first arrive at the shop before this order can be processed.',
      });

      // Optimistically update order count
      setOrderCount(prev => (prev !== null ? prev + 1 : 1));

      // Refresh order count from server to ensure DB consistency
      setTimeout(async () => {
        const newCount = await countCustomerOrdersToday(user.id);
        setOrderCount(newCount);
      }, 500);

      setIsCustomerInfoDialogOpen(false);
      customerFormReset();
      formReset();
      router.push('/order-status');
    } catch (err: any) {
      console.error('Unexpected error submitting order:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'An unexpected error occurred while submitting your order.',
      });
    }
  }

  return { submitOrder, orderCount, setOrderCount };
}
