
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && profile?.role !== 'admin' && !isLoginPage) {
      router.push('/admin/login');
    }
    if (!loading && profile?.role === 'admin' && isLoginPage) {
      router.push('/admin');
    }
  }, [profile, loading, router, isLoginPage]);

  // If we are on the login page and not an admin, show the login page
  if (isLoginPage && profile?.role !== 'admin') {
     return (
        <div className="flex flex-col h-screen">
            <AppHeader showLogo={true} />
            <main className="flex-1 flex items-center justify-center">
                {children}
            </main>
            <AppFooter />
        </div>
     )
  }

  // If loading, or if not an admin (and not on login page), show loader
  if (loading || profile?.role !== 'admin') {
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

  // If admin, show the protected content
  return (
    <div className="flex flex-col h-screen">
        <AppHeader showLogo={true} />
        <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
            {children}
        </main>
        <AppFooter />
    </div>
  );
}
