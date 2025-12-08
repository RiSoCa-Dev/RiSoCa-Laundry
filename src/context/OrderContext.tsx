'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Order } from '@/components/order-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, collectionGroup, query } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[]; // For admin view
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  loading: boolean;
  loadingAdmin: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Hook for fetching the current user's orders
  const userOrdersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/orders`);
  }, [user, firestore]);

  const { data: orders, isLoading: loading, error: userError } = useCollection<Order>(userOrdersQuery);

  // Hook for fetching ALL orders for the admin
  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Use a collection group query to fetch orders from all users
    return query(collectionGroup(firestore, 'orders'));
  }, [firestore]);

  const { data: allOrdersData, isLoading: loadingAdmin, error: adminError } = useCollection<Order>(allOrdersQuery);

  const addOrder = async (newOrderData: Omit<Order, 'id'| 'orderDate'>) => {
    if (!user || !firestore) return;

    // Save to the user-specific subcollection
    const userOrdersCollectionRef = collection(firestore, `users/${user.uid}/orders`);
    const globalOrdersCollectionRef = collection(firestore, `orders`);
    
    try {
      const orderPayload = {
        ...newOrderData,
        orderDate: serverTimestamp(),
      };
      
      // Write to the user's subcollection for their own view
      await addDoc(userOrdersCollectionRef, orderPayload).catch(err => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userOrdersCollectionRef.path,
            operation: 'create',
            requestResourceData: orderPayload,
         }));
      });

      // Also write to the global collection for admin view
       await addDoc(globalOrdersCollectionRef, orderPayload).catch(err => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: globalOrdersCollectionRef.path,
            operation: 'create',
            requestResourceData: orderPayload,
         }));
      });


    } catch (e) {
      console.error("Error adding order:", e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!firestore) return;

    // This needs to update the document in the global 'orders' collection
    // because this action is performed by an admin
    const orderDocRef = doc(firestore, 'orders', orderId);

    try {
       await updateDoc(orderDocRef, { status }).catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: orderDocRef.path,
            operation: 'update',
            requestResourceData: { status },
         }));
       });
    } catch (e) {
       console.error('Error updating order status:', e);
    }
  };
  
  const memoizedOrders = useMemo(() => orders || [], [orders]);
  const memoizedAllOrders = useMemo(() => allOrdersData || [], [allOrdersData]);


  return (
    <OrderContext.Provider value={{ orders: memoizedOrders, allOrders: memoizedAllOrders, addOrder, updateOrderStatus, loading, loadingAdmin }}>
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
