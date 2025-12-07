
'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { OrderStatusTracker } from '@/components/order-status-tracker';
import { CustomerOrderList } from '@/components/customer-order-list';
import type { Order } from '@/components/order-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const initialOrders: Order[] = [
  { id: 'ORD001', customer: 'John Doe', contact: '09171234567', load: 1, weight: 7.5, status: 'Washing', total: 450.0 },
  { id: 'ORD002', customer: 'Jane Smith', contact: '09182345678', load: 2, weight: 15, status: 'Pickup Scheduled', total: 220.5 },
  { id: 'ORD003', customer: 'Bob Johnson', contact: '09193456789', load: 1, weight: 5, status: 'Out for Delivery', total: 180.0 },
  { id: 'ORD004', customer: 'Alice Williams', contact: '09204567890', load: 3, weight: 22, status: 'Delivered', total: 300.0 },
  { id: 'ORD005', customer: 'Charlie Brown', contact: '09215678901', load: 1, weight: 8, status: 'Folding', total: 150.75 },
];


export default function OrderStatusPage() {
    const [orders] = useState<Order[]>(initialOrders);
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
