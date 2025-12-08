'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { OrderList } from '@/components/order-list';
import type { Order } from '@/components/order-list';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

// Mock data, as Firebase is removed
const mockOrders: Order[] = [
    { id: 'ORD123', userId: 'user1', customerName: 'John Doe', contactNumber: '09123456789', load: 1, weight: 7.5, status: 'Washing', total: 180, orderDate: new Date(), servicePackage: 'package1', distance: 0 },
    { id: 'ORD124', userId: 'user2', customerName: 'Jane Smith', contactNumber: '09987654321', load: 2, weight: 15, status: 'Ready for Pick Up', total: 360, orderDate: new Date(), servicePackage: 'package1', distance: 0 },
];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [allOrders, setAllOrders] = useState(mockOrders);
  const [loadingAdmin, setLoadingAdmin] = useState(false);


  const handleUpdateOrder = async (updatedOrder: Order) => {
    setLoadingAdmin(true);
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    toast({
        title: 'Order Updated',
        description: `Order #${updatedOrder.id.substring(0, 7)} has been updated to ${updatedOrder.status}.`,
    });
    setLoadingAdmin(false);
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage All Orders</CardTitle>
          <CardDescription>View and update all customer orders.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loadingAdmin ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Loading all orders...</p>
          </div>
        ) : allOrders && allOrders.length > 0 ? (
          <OrderList 
            orders={allOrders} 
            onUpdateOrder={handleUpdateOrder}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2" />
            <p>No orders have been placed yet across the platform.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
