'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'admin' | 'customer';
}

interface AuthContextType {
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        // Always set loading to true when user or firestore instance changes.
        setProfileLoading(true);

        if (isUserLoading) {
            // If the user object is still loading, we can't do anything yet.
            // The loading state is already true, so we just wait.
            return;
        }

        if (!user || !firestore) {
            // If there's no user or no firestore, we are done loading.
            setProfile(null);
            setProfileLoading(false);
            return;
        }
        
        // At this point, we have a user and a firestore instance.
        // We subscribe to their profile document.
        const profileDocRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            } else {
                // User document doesn't exist, which might be an error state
                // or just a user that hasn't completed signup.
                setProfile(null);
            }
            // Once we get a response (or a confirmation of non-existence), profile loading is done.
            setProfileLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setProfile(null);
            setProfileLoading(false);
        });

        // Cleanup subscription on unmount or if dependencies change.
        return () => unsubscribe();
    }, [user, isUserLoading, firestore]);

    // The overall loading state depends on BOTH the user object loading AND the profile document loading.
    const isLoading = isUserLoading || profileLoading;

    return (
        <AuthContext.Provider value={{ profile, loading: isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
