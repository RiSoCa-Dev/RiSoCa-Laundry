
'use client';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { OrderList } from '@/components/order-list';
import { useOrders } from '@/context/OrderContext';

export default function AdminPage() {
  const { orders, updateOrderStatus } = useOrders();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
  };

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
            <OrderList orders={orders} onStatusChange={handleStatusChange} />
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
