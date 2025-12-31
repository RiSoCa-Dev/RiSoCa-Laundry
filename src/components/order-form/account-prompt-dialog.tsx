"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AccountPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountPromptDialog({ open, onOpenChange }: AccountPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an Account to Continue</DialogTitle>
          <DialogDescription>
            Creating an account allows you to easily track your orders and view your order history. It only takes a minute!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold">Benefits of creating an account:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Track all your orders in one place</li>
              <li>View order history and status updates</li>
              <li>Faster checkout for future orders</li>
              <li>Receive order notifications</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              asChild
              className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/register">
                Create Account
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/login">
                Already have an account? Log in
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
