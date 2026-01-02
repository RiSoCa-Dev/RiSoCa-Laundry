'use client';

import { ServiceRatesEditor } from '@/components/service-rates-editor';

export default function AdminServiceRatesPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-6 md:mb-8 w-full">
        <h1 className="text-2xl md:text-4xl font-bold text-primary">Manage Service Rates</h1>
        <p className="text-sm md:text-lg text-muted-foreground mt-2">Update pricing for services and delivery.</p>
      </div>
      
      <div className="w-full max-w-4xl">
        <ServiceRatesEditor />
      </div>
    </div>
  );
}
