"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/use-auth-session';
import { countCustomerOrdersToday } from '@/lib/api/orders';
import { orderSchema, customerInfoSchema, type OrderFormValues, type CustomerFormValues, type PendingOrder } from './order-form/types';
import { calculatePrice, type PricingResult } from './order-form/calculate-price';
import { PackageSelection } from './order-form/package-selection';
import { WeightLocationSection } from './order-form/weight-location-section';
import { PricingSummary } from './order-form/pricing-summary';
import { CustomerInfoDialog } from './order-form/customer-info-dialog';
import { AccountPromptDialog } from './order-form/account-prompt-dialog';
import { loadCustomerProfile } from './order-form/load-customer-profile';
import { submitOrder } from './order-form/submit-order';

export function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();
  const [isPending, startTransition] = useTransition();
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [calculatedLoads, setCalculatedLoads] = useState(1);
  const [showDistancePrompt, setShowDistancePrompt] = useState(false);

  const [isCustomerInfoDialogOpen, setIsCustomerInfoDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [showAccountPromptDialog, setShowAccountPromptDialog] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loadingOrderCount, setLoadingOrderCount] = useState(false);
  
  const distanceParam = searchParams.get('distance');
  const packageParam = searchParams.get('servicePackage');

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      servicePackage: packageParam || 'package1',
      weight: undefined,
      distance: distanceParam ? parseFloat(distanceParam) : 0,
    },
    mode: 'onChange'
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
        customerName: '',
        contactNumber: '',
        deliveryOption: 'drop-off',
    }
  });

  const { watch, setValue, trigger, control } = form;
  const watchedValues = watch();
  const servicePackage = watch('servicePackage');
  const needsLocation = servicePackage === 'package2' || servicePackage === 'package3';
  const isFreeDelivery = needsLocation && watchedValues.distance > 0 && watchedValues.distance <= 0.5;

  // Auto-populate customer info from profile when dialog opens
  useEffect(() => {
    if (isCustomerInfoDialogOpen && user) {
      loadCustomerProfile(user, customerForm.setValue);
    }
  }, [isCustomerInfoDialogOpen, user, customerForm]);

  useEffect(() => {
    if (distanceParam) {
      const numericDistance = parseFloat(distanceParam);
      if (!isNaN(numericDistance)) {
        setValue('distance', numericDistance, { shouldValidate: true });
        // Trigger validation after setting value
        trigger('distance');
      }
    } else if (needsLocation) {
      // If needs location but no distance param, reset to 0
      setValue('distance', 0, { shouldValidate: true });
      trigger('distance');
    }
  }, [distanceParam, setValue, trigger, needsLocation]);

  // Load order count for logged-in users
  useEffect(() => {
    async function loadOrderCount() {
      if (!user || authLoading) {
        setOrderCount(null);
        return;
      }
      
      setLoadingOrderCount(true);
      const count = await countCustomerOrdersToday(user.id);
      setOrderCount(count);
      setLoadingOrderCount(false);
    }

    loadOrderCount();
  }, [user, authLoading]);

  const handleLocationSelect = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('servicePackage', watchedValues.servicePackage);
    
    // Store servicePackage in localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedServicePackage', watchedValues.servicePackage);
    }
    
    router.push(`/select-location?${params.toString()}`);
  };

  useEffect(() => {
    if (!needsLocation && !distanceParam) { 
        setValue('distance', 0);
    }
    trigger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsLocation, setValue, trigger]);


  const handleCalculatePrice = (values: OrderFormValues) => {
    startTransition(() => {
      const { result, loads, showDistancePrompt } = calculatePrice(values);
      setPricingResult(result);
      setCalculatedLoads(loads);
      setShowDistancePrompt(showDistancePrompt);
    });
  };

  useEffect(() => {
    const subscription = watch((values) => {
      const parsed = orderSchema.safeParse(values);
      if (parsed.success) {
        handleCalculatePrice(parsed.data);
      } else {
        const needsDistance = (values.servicePackage === 'package2' || values.servicePackage === 'package3');
        if (needsDistance && (!values.distance || values.distance <= 0)) {
          setPricingResult(null);
          setShowDistancePrompt(true);
        } else if (values.servicePackage === 'package1') {
          handleCalculatePrice(values as OrderFormValues);
        } else {
          setPricingResult(null);
          setShowDistancePrompt(false);
        }
      }
    });
    
    handleCalculatePrice(form.getValues());
    
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const onOrderSubmit = (data: OrderFormValues) => {
    if (authLoading) return;
    if (!user) {
        // Show dialog prompting to create account first
        setShowAccountPromptDialog(true);
        return;
    }
    if (!pricingResult) return;
    setPendingOrder({
        orderData: data,
        pricing: pricingResult,
        loads: calculatedLoads
    });
    setIsCustomerInfoDialogOpen(true);
  };

  const onCustomerInfoSubmit = async (customerData: CustomerFormValues) => {
    if (!pendingOrder || !user) return;
    
    await submitOrder(
      pendingOrder,
      customerData,
      user,
      router,
      toast,
      setOrderCount,
      setIsCustomerInfoDialogOpen,
      customerForm.reset,
      form.reset
    );
  };

  return (
    <>
    <Card className="shadow-xl w-full flex flex-col border-2">
      <form onSubmit={form.handleSubmit(onOrderSubmit)} className="flex flex-col">
        <CardHeader className="p-5 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Order Details
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Complete the form below to create your order. All fields are required unless marked optional.
              </CardDescription>
            </div>
            {user && (
              <div className="text-right bg-background/80 px-3 py-2 rounded-lg border">
                <p className="text-xs text-muted-foreground font-medium">Orders Today</p>
                {loadingOrderCount ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                ) : orderCount !== null ? (
                  <p className={`text-lg font-bold ${orderCount >= 5 ? 'text-destructive' : 'text-primary'}`}>
                    {orderCount}/5
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-6">
          
          <PackageSelection control={control} errors={form.formState.errors} />

          <Separator />

          <WeightLocationSection
            control={control}
            watch={watch}
            errors={form.formState.errors}
            needsLocation={needsLocation}
            isFreeDelivery={isFreeDelivery}
            onLocationSelect={handleLocationSelect}
          />

          <Separator />

          <PricingSummary
            isPending={isPending}
            showDistancePrompt={showDistancePrompt}
            pricingResult={pricingResult}
            calculatedLoads={calculatedLoads}
            servicePackage={servicePackage}
          />
        </CardContent>
        <CardFooter className="p-5 sm:p-6 pt-0 flex-shrink-0 border-t bg-muted/30">
          <Button 
            type="submit" 
            className="w-full text-base font-semibold py-6 h-auto shadow-lg hover:shadow-xl transition-all"
            disabled={isPending || !form.formState.isValid || showDistancePrompt}
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Place Order
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
      <AccountPromptDialog 
        open={showAccountPromptDialog} 
        onOpenChange={setShowAccountPromptDialog} 
      />

      <CustomerInfoDialog
        open={isCustomerInfoDialogOpen}
        onOpenChange={setIsCustomerInfoDialogOpen}
        customerForm={customerForm}
        pendingOrder={pendingOrder}
        onSubmit={onCustomerInfoSubmit}
      />
    </>
  );
}
