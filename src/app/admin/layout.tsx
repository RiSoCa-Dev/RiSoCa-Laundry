
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [profile, loading, router]);

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
