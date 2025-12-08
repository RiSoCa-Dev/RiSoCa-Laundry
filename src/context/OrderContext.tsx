
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

  // DEFINITIVE FIX: This logic is now stricter. It will not return any query
  // until it knows for sure what the user's role is.
  const ordersQuery = useMemoFirebase(() => {
    // 1. Wait for all dependencies to be ready.
    // If profile is loading, or firestore/user aren't available, do nothing.
    if (profileLoading || !firestore || !user) {
      return null;
    }

    // 2. We now have a loaded profile or null. Check the role EXPLICITLY.
    if (profile && profile.role === 'admin') {
      // User is an admin, fetch all orders.
      return query(collection(firestore, 'orders'), orderBy("orderDate", "desc"));
    }
    
    // 3. If it's not an admin, it MUST be a customer. Fetch only their orders.
    // This runs even if the profile is null for a split second after login,
    // ensuring we never try to fetch all orders for a non-admin.
    return query(collection(firestore, 'orders'), where("userId", "==", user.uid), orderBy("orderDate", "desc"));

  }, [user, firestore, profile, profileLoading]);

  const { data: ordersData, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const addOrder = async (newOrderData: Omit<Order, 'id' | 'orderDate'>) => {
    if (!user || !firestore) return;

    const orderPayload = {
      ...newOrderData,
      orderDate: serverTimestamp(),
      userId: user.uid,
    };
    
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
    if (!firestore) return;

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

  // The hook is loading if the profile is loading OR if the orders query is still running.
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
