'use client';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { ContactCard } from '@/components/contact-card';

const phoneNumbers = [
  '09157079908',
  '09459787490',
  '09154354549',
  '09288112476',
];

export default function ContactUsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-full">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-4">Contact Us</h1>
            <p className="text-sm md:text-base text-muted-foreground text-center mb-8">
              Get in touch with us. We're here to help!
            </p>
            <ContactCard phoneNumbers={phoneNumbers} />
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
