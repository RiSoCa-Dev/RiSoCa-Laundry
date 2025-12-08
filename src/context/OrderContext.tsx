
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Order } from '@/components/order-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy, WriteBatch, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[]; // For admin view
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => void;
  loading: boolean;
  loadingAdmin: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useAuth();
  const firestore = useFirestore();
  
  const userOrdersQuery = useMemoFirebase(() => {
    // CRITICAL FIX: Do not run any query until the user's profile (and role) is loaded.
    if (profileLoading || !user || !firestore || profile?.role === 'admin') {
        return null;
    }
    return query(collection(firestore, "orders"), where("userId", "==", user.uid), orderBy("orderDate", "desc"));
  }, [user, firestore, profile, profileLoading]);

  const { data: ordersData, isLoading: loading } = useCollection<Order>(userOrdersQuery);

  const allOrdersQuery = useMemoFirebase(() => {
    // CRITICAL FIX: Do not run any query until the user's profile (and role) is loaded.
    if (profileLoading || !firestore || profile?.role !== 'admin') {
      return null;
    }
    return query(collection(firestore, 'orders'), orderBy("orderDate", "desc"));
  }, [firestore, profile, profileLoading]);

  const { data: allOrdersData, isLoading: loadingAdmin } = useCollection<Order>(allOrdersQuery);

  const addOrder = async (newOrderData: Omit<Order, 'id'| 'orderDate'>) => {
    if (!user || !firestore) return;

    const ordersCollectionRef = collection(firestore, `orders`);
    
    const orderPayload = {
      ...newOrderData,
      orderDate: serverTimestamp(),
    };
    
    addDoc(ordersCollectionRef, orderPayload).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: ordersCollectionRef.path,
        operation: 'create',
        requestResourceData: orderPayload,
        }));
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!firestore) return;

    const orderDocRef = doc(firestore, 'orders', orderId);
    
    updateDoc(orderDocRef, { status }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: orderDocRef.path,
        operation: 'update',
        requestResourceData: { status },
        }));
    });
  };
  
  const memoizedOrders = useMemo(() => ordersData || [], [ordersData]);
  const memoizedAllOrders = useMemo(() => allOrdersData || [], [allOrdersData]);

  const isLoadingCombined = profileLoading || loading;
  const isAdminLoadingCombined = profileLoading || loadingAdmin;

  return (
    <OrderContext.Provider value={{ orders: memoizedOrders, allOrders: memoizedAllOrders, addOrder, updateOrderStatus, loading: isLoadingCombined, loadingAdmin: isAdminLoadingCombined }}>
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
