
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { OrderList, Order } from '@/components/order-list';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (profile?.role !== 'admin') {
        router.push('/admin/login');
      }
    }
  }, [profile, loading, router]);
  
  useEffect(() => {
      async function fetchAdminOrders() {
        if (profile?.role === 'admin') {
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
      }
      fetchAdminOrders();
  }, [profile]);


  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
    // Optimistically update local state for admin
    setAdminOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };

  if (loading || profile?.role !== 'admin') {
     return (
        <div className="flex flex-col h-screen">
          <AppHeader showLogo={true} />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
          <AppFooter />
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader showLogo={true} />
      <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
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
      </main>
      <AppFooter />
    </div>
  );
}
