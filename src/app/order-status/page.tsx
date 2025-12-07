
'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { OrderStatusTracker } from '@/components/order-status-tracker';
import { CustomerOrderList } from '@/components/customer-order-list';
import type { Order } from '@/components/order-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';

export default function OrderStatusPage() {
    const { orders } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleSelectOrder = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleBackToList = () => {
        setSelectedOrder(null);
    }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader showLogo={true} />
      <main className="flex-1 overflow-y-auto flex items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl">
          {selectedOrder ? (
            <>
                <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Orders
                </Button>
                <OrderStatusTracker order={selectedOrder} />
            </>
          ) : (
            <CustomerOrderList orders={orders} onOrderSelect={handleSelectOrder} />
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
