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
import { Loader2, Inbox, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ManualOrderDialog } from '@/components/manual-order-dialog';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


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

  const handleAddOrder = async (newOrder: Omit<Order, 'id' | 'orderDate' | 'userId'>) => {
    const orderToAdd: Order = {
      ...newOrder,
      id: `RKR${Math.floor(Math.random() * 900) + 100}`,
      userId: 'admin-manual',
      orderDate: new Date(),
    };
    
    setAllOrders(prevOrders => [orderToAdd, ...prevOrders]);
    toast({
        title: 'Order Created',
        description: `New order for ${newOrder.customerName} has been added.`,
    });
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>View and update all customer orders.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
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
      <ManualOrderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddOrder={handleAddOrder}
      />
    </>
  );
}
