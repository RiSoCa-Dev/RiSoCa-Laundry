
import { Facebook, Mail, Clock } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full py-2 px-4 bg-background/95 border-t">
      <div className="container mx-auto flex flex-wrap items-center justify-center text-xs text-muted-foreground gap-x-4 gap-y-1">
        <p>&copy; {new Date().getFullYear()} RKR Laundry. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Mon-Sun: 7:30 AM - 7:30 PM</span>
        </div>
        <div className="flex items-center space-x-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </a>
          <a href="mailto:risoca2025@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
