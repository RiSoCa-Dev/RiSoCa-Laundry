
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { pricingLogicGuidance, PricingLogicGuidanceOutput } from '@/ai/flows/pricing-logic-guidance';
import { Lightbulb, Loader2, Shirt, Sparkles, Truck, WashingMachine, Wind, AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';

const services = [
  { id: 'wash', label: 'Wash', icon: WashingMachine },
  { id: 'dry', label: 'Dry', icon: Wind },
  { id: 'fold', label: 'Fold', icon: Shirt },
];

const addOns = [
  { id: 'stain_removal', label: 'Stain Removal', icon: Sparkles },
  { id: 'ironing', label: 'Ironing', icon: Shirt },
];

const orderSchema = z.object({
  serviceTypes: z.array(z.string()).min(1, "Please select at least one service."),
  addOns: z.array(z.string()).optional(),
  distance: z.coerce.number().min(0, "Distance cannot be negative.").max(50, "We don't deliver beyond 50 miles."),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function OrderForm() {
  const [isPending, startTransition] = useTransition();
  const [pricingResult, setPricingResult] = useState<PricingLogicGuidanceOutput | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceTypes: ['wash', 'dry'],
      addOns: [],
      distance: 5,
    },
    mode: 'onChange'
  });

  const calculatePrice = (values: OrderFormValues | undefined) => {
    if (!values) return;
    const parsed = orderSchema.safeParse(values);
    if (parsed.success) {
        startTransition(async () => {
            const result = await pricingLogicGuidance(parsed.data);
            setPricingResult(result);
        });
    } else {
        setPricingResult(null);
    }
  }

  useEffect(() => {
    const subscription = form.watch((value) => {
        const handler = setTimeout(() => {
            calculatePrice(value as OrderFormValues);
        }, 300);
        return () => clearTimeout(handler);
    });

    // Initial calculation on mount
    calculatePrice(form.getValues());

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: OrderFormValues) => {
    console.log('Order submitted:', data, 'with price:', pricingResult?.computedPrice);
    alert(`Order placed! Total cost: $${pricingResult?.computedPrice.toFixed(2)}`);
  };

  return (
    <Card className="shadow-lg w-full">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader className="p-4">
          <CardTitle>Create Order</CardTitle>
          <CardDescription className="text-xs">Select services to calculate the price.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          
          <div className="space-y-2">
            <Label className="text-base font-semibold">1. Services</Label>
            <div className="grid grid-cols-3 gap-2">
              {services.map((service) => (
                <Controller
                  key={service.id}
                  name="serviceTypes"
                  control={form.control}
                  render={({ field }) => {
                    const isChecked = field.value?.includes(service.id);
                    return (
                        <div className={`p-0.5 rounded-md transition-all ${isChecked ? 'bg-primary' : 'bg-transparent'}`}>
                          <Label htmlFor={service.id} className={`flex flex-col items-center justify-center gap-1 text-sm font-medium cursor-pointer p-2 rounded-sm border-2 transition-all ${isChecked ? 'bg-card border-primary' : 'bg-card hover:bg-muted border-transparent'}`}>
                            <service.icon className={`h-6 w-6 transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                            {service.label}
                            <Checkbox
                                id={service.id}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, service.id]
                                    : field.value?.filter((value) => value !== service.id);
                                  field.onChange(newValue);
                                }}
                                className="absolute opacity-0"
                              />
                          </Label>
                        </div>
                    );
                  }}
                />
              ))}
            </div>
            {form.formState.errors.serviceTypes && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.serviceTypes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">2. Add-Ons</Label>
            <div className="grid grid-cols-3 gap-2">
              {addOns.map((addOn) => (
                <Controller
                  key={addOn.id}
                  name="addOns"
                  control={form.control}
                  render={({ field }) => {
                    const isChecked = field.value?.includes(addOn.id);
                    return (
                      <div className={`p-0.5 rounded-md transition-all ${isChecked ? 'bg-primary' : 'bg-transparent'}`}>
                        <Label htmlFor={addOn.id} className={`flex flex-col items-center justify-center gap-1 text-sm font-medium cursor-pointer p-2 rounded-sm border-2 transition-all ${isChecked ? 'bg-card border-primary' : 'bg-card hover:bg-muted border-transparent'}`}>
                          <addOn.icon className={`h-6 w-6 transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                          {addOn.label}
                          <Checkbox
                              id={addOn.id}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value ?? []), addOn.id]
                                  : (field.value ?? [])?.filter((value) => value !== addOn.id);
                                field.onChange(newValue);
                              }}
                              className="absolute opacity-0"
                            />
                        </Label>
                      </div>
                    )
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distance" className="text-base font-semibold">3. Location</Label>
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div className='flex-grow'>
                    <Label htmlFor="distance" className="text-xs font-medium text-muted-foreground">Distance (miles)</Label>
                    <Controller
                    name="distance"
                    control={form.control}
                    render={({ field }) => <Input id="distance" type="number" placeholder="5" className="bg-transparent border-0 text-base font-semibold p-0 h-auto focus-visible:ring-0" {...field} />}
                    />
                </div>
            </div>
            {form.formState.errors.distance && (
              <p className="text-xs font-medium text-destructive">{form.formState.errors.distance.message}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-semibold">Pricing Summary</h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                {isPending ? (
                    <div className="flex items-center justify-center text-muted-foreground h-16">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Calculating...</span>
                    </div>
                ) : pricingResult ? (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-base">Total</span>
                            <span className="text-2xl font-bold text-primary">
                                ${pricingResult.computedPrice.toFixed(2)}
                            </span>
                        </div>
                        {pricingResult.isValidCombination && pricingResult.suggestedServices.length > 0 && (
                            <Alert className='bg-primary/5 border-primary/20 p-2'>
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <AlertTitle className='text-primary text-xs font-semibold'>Suggestion</AlertTitle>
                                <AlertDescription className="text-xs">
                                    {pricingResult.suggestedServices[0]}
                                </AlertDescription>
                            </Alert>
                        )}
                        {!pricingResult.isValidCombination && pricingResult.invalidServiceChoices && pricingResult.invalidServiceChoices.length > 0 && (
                            <Alert variant="destructive" className="p-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="text-xs font-semibold">Invalid Selection</AlertTitle>
                                <AlertDescription className="text-xs">
                                    {pricingResult.invalidServiceChoices[0]}
                                </AlertDescription>
                            </Alert>
                        )}
                    </>
                ) : (
                    <div className="text-center text-muted-foreground h-16 flex items-center justify-center text-sm">Select services to see price.</div>
                )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            type="submit" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-5"
            disabled={isPending || !pricingResult?.isValidCombination || !form.formState.isValid}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Place Order
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
