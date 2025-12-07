
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Order } from '@/components/order-list';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'created_at' | 'customer_id'>) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      };

      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const addOrder = async (newOrder: Omit<Order, 'created_at' | 'customer_id'>) => {
    if (!user) return;

    const orderWithCustomerId = { ...newOrder, customer_id: user.id };
    
    const { data, error } = await supabase
      .from('orders')
      .insert(orderWithCustomerId)
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
    } else {
      setOrders((prevOrders) => [data as Order, ...prevOrders]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
     const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? (data as Order) : order
        )
      );
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, loading }}>
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
