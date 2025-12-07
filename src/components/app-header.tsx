
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, WashingMachine } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: '/order-status', label: 'Order Status' },
  { href: '/create-order', label: 'Create Order' },
  { href: '/service-rates', label: 'Service Rates' },
  { href: '/laundry-calculator', label: 'Calculator' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/branches', label: 'Branches' },
  { href: '/contact-us', label: 'Contact Us' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
            <WashingMachine className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">RKR Laundry</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
                <SheetTitle>
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
                        Home
                    </Link>
                </SheetTitle>
            </SheetHeader>
            <nav className="grid gap-4 text-base font-medium mt-8">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
