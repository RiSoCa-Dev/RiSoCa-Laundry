'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Order } from '@/components/order-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[]; // For admin view, now sourced from the same query logic
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  loading: boolean;
  loadingAdmin: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useAuth();
  const firestore = useFirestore();

  // Unified query for all orders. Security rules will handle filtering.
  const ordersQuery = useMemoFirebase(() => {
    if (profileLoading || !firestore || !user) {
      return null;
    }
    
    // Admin gets all orders
    if (profile?.role === 'admin') {
      return query(collection(firestore, 'orders'), orderBy("orderDate", "desc"));
    }
    
    // Customer gets only their orders
    return query(collection(firestore, 'orders'), where("userId", "==", user.uid), orderBy("orderDate", "desc"));

  }, [user, firestore, profile, profileLoading]);

  const { data: ordersData, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const addOrder = async (newOrderData: Omit<Order, 'id' | 'orderDate'>) => {
    if (!user || !firestore) return;

    const orderPayload = {
      ...newOrderData,
      orderDate: serverTimestamp(),
      userId: user.uid, // Ensure userId is always set
    };
    
    // Add to the single, global collection
    const ordersColRef = collection(firestore, 'orders');
    addDoc(ordersColRef, orderPayload).catch(err => {
      console.error("Add order failed:", err);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'orders',
        operation: 'create',
        requestResourceData: orderPayload,
      }));
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!firestore || !profile || profile.role !== 'admin') return;

    const orderRef = doc(firestore, 'orders', orderId);
    
    updateDoc(orderRef, { status }).catch(err => {
        console.error("Order status update failed:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `orders/${orderId}`,
        operation: 'update',
        requestResourceData: { status },
        }));
    });
  };
  
  const memoizedOrders = useMemo(() => ordersData || [], [ordersData]);

  // Admin and customer now use the same loading flag and data source
  const isLoadingCombined = profileLoading || ordersLoading;

  return (
    <OrderContext.Provider value={{ orders: memoizedOrders, allOrders: memoizedOrders, addOrder, updateOrderStatus, loading: isLoadingCombined, loadingAdmin: isLoadingCombined }}>
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
