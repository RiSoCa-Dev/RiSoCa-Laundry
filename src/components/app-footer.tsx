
import { Facebook, Mail } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="w-full py-2 px-4 bg-background/95 border-t">
      <div className="container mx-auto flex flex-col items-center justify-center space-y-1 text-[10px] text-muted-foreground">
        <div className="flex items-center space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="h-6 w-6" />
            <span className="sr-only">Facebook</span>
          </a>
          <a href="mailto:risoca2025@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
            <Mail className="h-6 w-6" />
            <span className="sr-only">Email</span>
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} RKR Laundry. All rights reserved.</p>
      </div>
    </footer>
  );
}
