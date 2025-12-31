"use client";

import { Controller, Control, FieldErrors } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Package, Truck, Sparkles } from 'lucide-react';
import { OrderFormValues, packages } from './types';

interface PackageSelectionProps {
  control: Control<OrderFormValues>;
  errors: FieldErrors<OrderFormValues>;
}

const packageIcons = {
  package1: Package,
  package2: Truck,
  package3: Sparkles,
};

export function PackageSelection({ control, errors }: PackageSelectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">1</span>
        </div>
        <Label className="text-base font-semibold">Select Service Package</Label>
      </div>
      <Controller
        name="servicePackage"
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {packages.map((pkg) => {
              const Icon = packageIcons[pkg.id as keyof typeof packageIcons] || Package;
              return (
                <Label
                  key={pkg.id}
                  htmlFor={pkg.id}
                  className={`flex flex-col items-start gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                    field.value === pkg.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <RadioGroupItem value={pkg.id} id={pkg.id} className="flex-shrink-0"/>
                    <Icon className={`h-5 w-5 flex-shrink-0 ${field.value === pkg.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-base block">{pkg.label}</span>
                      <span className="text-xs text-muted-foreground block mt-0.5">{pkg.description}</span>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        )}
      />
      {errors.servicePackage && (
        <p className="text-xs font-medium text-destructive ml-10">
          {errors.servicePackage.message}
        </p>
      )}
    </div>
  );
}
