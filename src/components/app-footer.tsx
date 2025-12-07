
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="w-full py-2">
      <div className="container mx-auto flex flex-col items-center justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-4 mb-2">
          <Link href="#" className="hover:text-primary"><Facebook className="h-4 w-4" /></Link>
          <Link href="#" className="hover:text-primary"><Twitter className="h-4 w-4" /></Link>
          <Link href="#" className="hover:text-primary"><Instagram className="h-4 w-4" /></Link>
        </div>
        <p>&copy; {new Date().getFullYear()} RKR Laundry. All rights reserved.</p>
      </div>
    </footer>
  );
}
