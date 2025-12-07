
'use client';

import { useState } from 'react';
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

const initialOrders = [
  { id: 'ORD001', customer: 'John Doe', status: 'Washing', total: 450.0 },
  { id: 'ORD002', customer: 'Jane Smith', status: 'Pickup Scheduled', total: 220.5 },
  { id: 'ORD003', customer: 'Bob Johnson', status: 'Out for Delivery', total: 180.0 },
  { id: 'ORD004', customer: 'Alice Williams', status: 'Delivered', total: 300.0 },
  { id: 'ORD005', customer: 'Charlie Brown', status: 'Folding', total: 150.75 },
];

export default function AdminPage() {
  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
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
