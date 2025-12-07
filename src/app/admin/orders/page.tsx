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
        setAdminOrders(data as Order[]);
      }
      setOrdersLoading(false);
    }
    fetchAdminOrders();
  }, [toast]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistically update local state for a responsive UI
    setAdminOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not update status for order ${orderId}.`,
      });
      // Revert the optimistic update on failure
      const { data: revertedOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (revertedOrders) setAdminOrders(revertedOrders as Order[]);

    } else {
        toast({
            title: 'Status Updated',
            description: `Order ${orderId} is now "${newStatus}".`,
        });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Orders</CardTitle>
        <CardDescription>Manage and track all customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Loading all orders...</p>
          </div>
        ) : adminOrders.length > 0 ? (
          <OrderList orders={adminOrders} onStatusChange={handleStatusChange} />
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
