
import { AppHeader } from '@/components/app-header';
import { OrderForm } from '@/components/order-form';
import { OrderStatusTracker } from '@/components/order-status-tracker';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <OrderForm />
          </div>
          <div className="lg:col-span-2">
            <OrderStatusTracker />
          </div>
        </div>
      </main>
    </div>
  );
}
