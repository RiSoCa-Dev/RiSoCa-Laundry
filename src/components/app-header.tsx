
import { Bell, WashingMachine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <WashingMachine className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary font-headline">
            RKR Laundry
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Bell className="h-6 w-6" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
