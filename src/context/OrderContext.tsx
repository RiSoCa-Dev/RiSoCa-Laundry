
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order } from '@/components/order-list';

const initialOrders: Order[] = [
  { id: 'ORD001', customer: 'John Doe', contact: '09171234567', load: 1, weight: 7.5, status: 'Washing', total: 450.0 },
  { id: 'ORD002', customer: 'Jane Smith', contact: '09182345678', load: 2, weight: 15, status: 'Pickup Scheduled', total: 220.5 },
  { id: 'ORD003', customer: 'Bob Johnson', contact: '09193456789', load: 1, weight: 5, status: 'Out for Delivery', total: 180.0 },
  { id: 'ORD004', customer: 'Alice Williams', contact: '09204567890', load: 3, weight: 22, status: 'Delivered', total: 300.0 },
  { id: 'ORD005', customer: 'Charlie Brown', contact: '09215678901', load: 1, weight: 8, status: 'Folding', total: 150.75 },
];


interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
