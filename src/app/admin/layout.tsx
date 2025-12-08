'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { profile, loading: profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';
  const isLoading = isUserLoading || profileLoading;

  useEffect(() => {
    // If still loading, we can't make a decision, so wait.
    if (isLoading) return;

    // After loading, if there's no user, redirect to login unless we're already there.
    if (!user) {
      if (!isLoginPage) {
        router.push('/admin/login');
      }
      return;
    }

    // If there is a user, check their role.
    if (profile?.role === 'admin') {
      // If user is an admin and they are on the login page, redirect them to the dashboard.
      if (isLoginPage) {
        router.push('/admin');
      }
    } else {
      // If user is not an admin, they should be sent to the login page.
      if (!isLoginPage) {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, profile, router, isLoginPage]);

  // Show a full-page loader while we're determining the auth state and role.
  // Exception: Don't show this loader on the login page itself to avoid a flash.
  if (isLoading && !isLoginPage) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader showLogo={true} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <AppFooter />
      </div>
    );
  }
  
  // If loading is finished, but the user isn't an admin and isn't on the login page,
  // it means a redirect is in progress. Show a loader to prevent showing content they can't access.
  if (!isLoading && profile?.role !== 'admin' && !isLoginPage) {
    return (
       <div className="flex flex-col h-screen">
        <AppHeader showLogo={true} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <AppFooter />
      </div>
    )
  }

  // If the user is a confirmed admin, or if they are on the login page, render the children.
  // This also correctly handles the case where a non-logged-in user sees the login page.
  return (
    <div className="flex flex-col h-screen">
      <AppHeader showLogo={true} />
      <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8 flex items-center justify-center">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
