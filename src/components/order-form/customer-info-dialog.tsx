"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Controller, UseFormReturn } from 'react-hook-form';
import { User, Phone, Bike, PersonStanding, CheckCircle2, Info } from 'lucide-react';
import { CustomerFormValues, PendingOrder } from './types';

interface CustomerInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerForm: UseFormReturn<CustomerFormValues>;
  pendingOrder: PendingOrder | null;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
}

export function CustomerInfoDialog({
  open,
  onOpenChange,
  customerForm,
  pendingOrder,
  onSubmit,
}: CustomerInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Customer Information
          </DialogTitle>
          <DialogDescription>
            Please confirm your details to complete the order. Your contact number can be updated for this order only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={customerForm.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-muted-foreground"/>
              Customer Name
            </Label>
            <div className="relative">
              <Input 
                id="customerName" 
                placeholder="e.g., Jane Doe" 
                {...customerForm.register('customerName')} 
                disabled
                className="bg-muted/50 cursor-not-allowed pl-10 h-11"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Name is taken from your profile
            </p>
            {customerForm.formState.errors.customerName && (
              <p className="text-xs font-medium text-destructive">
                {customerForm.formState.errors.customerName.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4 text-muted-foreground"/>
              Contact Number
            </Label>
            <div className="relative">
              <Input 
                id="contactNumber" 
                type="tel" 
                placeholder="e.g., 09123456789" 
                {...customerForm.register('contactNumber')} 
                className="pl-10 h-11"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              You can edit this number for this order only (won't update your profile)
            </p>
            {customerForm.formState.errors.contactNumber && (
              <p className="text-xs font-medium text-destructive">
                {customerForm.formState.errors.contactNumber.message}
              </p>
            )}
          </div>
          
          {pendingOrder?.orderData.servicePackage === 'package2' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">Transport Option</Label>
              <Controller
                name="deliveryOption"
                control={customerForm.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Label htmlFor="drop-off" className={`flex items-center gap-2 rounded-lg border p-3 transition-all cursor-pointer hover:bg-muted/50 ${field.value === 'drop-off' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="drop-off" id="drop-off"/>
                      <PersonStanding className="h-4 w-4" />
                      <span className="font-semibold text-sm">Customer Drop-off</span>
                    </Label>
                    <Label htmlFor="pick-up" className={`flex items-center gap-2 rounded-lg border p-3 transition-all cursor-pointer hover:bg-muted/50 ${field.value === 'pick-up' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="pick-up" id="pick-up"/>
                      <Bike className="h-4 w-4" />
                      <span className="font-semibold text-sm">Rider Pick-up</span>
                    </Label>
                  </RadioGroup>
                )}
              />
            </div>
          )}
          
          {(pendingOrder?.orderData.servicePackage === 'package2' || 
            pendingOrder?.orderData.servicePackage === 'package3') && 
            (!pendingOrder?.orderData.weight || pendingOrder.orderData.weight <= 7.5) && (
            <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Important: Price May Change
                  </p>
                  <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                    <p>
                      • The current price is based on estimated weight (1 load = 7.5kg).
                    </p>
                    <p>
                      • <strong>If your actual weight exceeds 7.5kg</strong>, the final price will be adjusted accordingly.
                    </p>
                    <p>
                      • We will contact you via phone to confirm the updated weight and price before processing your order.
                    </p>
                    <p className="mt-2 font-medium">
                      📱 Please track your order status to see the confirmed weight and loads once your laundry arrives at the shop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="min-w-[120px]"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
