
import Image from 'next/image';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader showLogo={true} />
      <main className="flex-1 relative">
        <Image
          src="/terms_and_conditions.jpg"
          alt="Terms and Conditions"
          layout="fill"
          objectFit="contain"
          quality={100}
        />
      </main>
      <AppFooter />
    </div>
  );
}
