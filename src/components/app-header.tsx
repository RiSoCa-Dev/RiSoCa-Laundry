
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, UserCog, Download, Info, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: '/login', label: 'Administrator Login', icon: UserCog },
  { href: '/download-app', label: 'Download APK', icon: Download },
  { href: '/about', label: 'About', icon: Info },
  { href: '#', label: 'Exit System', icon: LogOut },
];

export function AppHeader() {
  return (
    <header className="w-full border-b bg-background/95">
      <div className="container flex h-14 items-center justify-end px-4 relative">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
             <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium mt-8">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-4 px-4 py-3 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted rounded-md">
                  <Icon className="h-6 w-6" />
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
