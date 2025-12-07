'use client';

import { ServiceRatesEditor } from '@/components/service-rates-editor';

export default function AdminServiceRatesPage() {
  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-primary">Manage Service Rates</h1>
        <p className="text-sm md:text-lg text-muted-foreground mt-2">Update pricing for services and delivery.</p>
      </div>
      
      <ServiceRatesEditor />
    </>
  );
}
