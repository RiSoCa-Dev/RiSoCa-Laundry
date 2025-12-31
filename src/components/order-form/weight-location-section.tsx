"use client";

import { Controller, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Weight, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { OrderFormValues } from './types';
import { useRouter, useSearchParams } from 'next/navigation';

interface WeightLocationSectionProps {
  control: Control<OrderFormValues>;
  watch: UseFormWatch<OrderFormValues>;
  errors: FieldErrors<OrderFormValues>;
  needsLocation: boolean;
  isFreeDelivery: boolean;
  onLocationSelect: () => void;
}

export function WeightLocationSection({
  control,
  watch,
  errors,
  needsLocation,
  isFreeDelivery,
  onLocationSelect,
}: WeightLocationSectionProps) {
  const watchedValues = watch();

  return (
    <div className={`grid gap-4 ${needsLocation ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">2</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Label htmlFor="weight" className="text-base font-semibold">Weight (kg)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs">
                <p className="text-sm">
                  Final weight will be confirmed at the shop. One load is 7.5kg. Any excess is considered a new load.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-muted/50 to-muted/30 p-4 rounded-lg border border-border">
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <Weight className="h-5 w-5 text-primary" />
          </div>
          <div className='flex-grow'>
            <Label htmlFor="weight" className="text-xs font-medium text-muted-foreground mb-1 block">
              Weight in KG (Optional)
            </Label>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <Input 
                  id="weight" 
                  type="number" 
                  placeholder="e.g., 7.5" 
                  className="text-center bg-background border-0 text-lg font-bold p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  {...field} 
                  value={field.value ?? ''} 
                  disabled={isFreeDelivery}
                />
              )}
            />
          </div>
        </div>
        {errors.weight && (
          <p className="text-xs font-medium text-destructive ml-10">
            {errors.weight.message}
          </p>
        )}
        {isFreeDelivery && (
          <div className="ml-10 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs text-center text-green-700 dark:text-green-300 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Free delivery applied! Weight set to 7.5kg.
            </p>
          </div>
        )}
      </div>
      
      {needsLocation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">3</span>
            </div>
            <Label htmlFor="distance" className="text-base font-semibold">Delivery Location</Label>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onLocationSelect} 
              className="w-full h-auto py-4 justify-start text-left border-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary"/>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">
                    {watchedValues.distance > 0 
                      ? `Distance: ${watchedValues.distance.toFixed(2)} km` 
                      : 'Select Location'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {watchedValues.distance > 0 
                      ? 'Click to change location' 
                      : 'Required for delivery'}
                  </p>
                </div>
              </div>
            </Button>
          </div>
          {errors.distance && !watchedValues.distance && (
            <p className="text-xs font-medium text-destructive ml-10">
              Please select a location.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
