import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 scrollable container mx-auto px-4 py-4 sm:py-8 pb-14 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
