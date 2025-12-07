'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { OrderList, Order } from '@/components/order-list';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminOrders() {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin orders:', error);
        toast({
            variant: 'destructive',
            title: 'Error Fetching Orders',
            description: 'Could not fetch orders from the database.',
        });
      } else {
        const fetchedOrders = data as Order[];
        setAdminOrders(fetchedOrders);
      }
      setOrdersLoading(false);
    }
    fetchAdminOrders();
  }, [toast]);
  
  const handleUpdateOrder = async (updatedOrder: Order) => {
    // Optimistically update UI
    setAdminOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    const { error } = await supabase
        .from('orders')
        .update({
            status: updatedOrder.status,
            weight: updatedOrder.weight,
            load: updatedOrder.load,
            total: updatedOrder.total,
        })
        .eq('id', updatedOrder.id);

    if (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: `Could not update order ${updatedOrder.id}. Please try again.`,
        });
        // On failure, you might want to refetch or revert the optimistic update
        // For simplicity, we are not reverting here but it's a good practice
    } else {
        toast({
            title: 'Order Updated',
            description: `Order ${updatedOrder.id} has been successfully updated.`,
            className: 'bg-green-500 text-white',
        });
    }
  }


  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>View and update all customer orders.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Loading all orders...</p>
          </div>
        ) : adminOrders.length > 0 ? (
          <OrderList 
            orders={adminOrders} 
            onUpdateOrder={handleUpdateOrder}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2" />
            <p>No orders have been placed yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
