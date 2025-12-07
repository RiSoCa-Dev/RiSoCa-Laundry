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
import { useOrders } from '@/context/OrderContext';
import { Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminOrdersPage() {
  const { updateOrderStatus } = useOrders();
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
        } else {
            setAdminOrders(data as Order[]);
        }
        setOrdersLoading(false);
      }
      fetchAdminOrders();
  }, []);


  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
    // Optimistically update local state for admin
    setAdminOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
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
            <p>Loading orders...</p>
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
