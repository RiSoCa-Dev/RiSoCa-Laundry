'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Order } from './order-list';
import { Loader2, Layers, Users, Calendar, User, DollarSign, CreditCard } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import { useEmployees } from '@/hooks/use-employees';
import { format } from 'date-fns';

const manualOrderSchema = z.object({
  customerName: z.string().min(2, 'Name is required.'),
  orderDate: z.string().min(1, 'Date is required.'),
  loads: z.number().min(1, 'Please select number of loads.').max(10, 'Maximum 10 loads allowed.'),
  total: z.coerce.number().min(0, 'Price must be 0 or greater.'),
  isPaid: z.boolean().optional(),
  assigned_employee_ids: z.array(z.string()).optional(), // Array of employee IDs
});

type ManualOrderFormValues = z.infer<typeof manualOrderSchema>;

type ManualOrderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Omit<Order, 'id' | 'userId'>) => Promise<void>;
};

type Employee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export function ManualOrderDialog({ isOpen, onClose, onAddOrder }: ManualOrderDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { employees, loading: loadingEmployees } = useEmployees();
  
  const form = useForm<ManualOrderFormValues>({
    resolver: zodResolver(manualOrderSchema),
    defaultValues: {
      customerName: '',
      orderDate: format(new Date(), 'yyyy-MM-dd'), // Default to today's date
      loads: undefined,
      total: undefined,
      isPaid: undefined,
      assigned_employee_ids: [],
    },
    mode: 'onChange',
  });

  const watchedLoads = form.watch('loads');
  const isPaid = form.watch('isPaid');

  // Calculate weight from loads (each load is 7.5 kg)
  const weight = useMemo(() => {
    if (!watchedLoads || watchedLoads <= 0) return 0;
    return watchedLoads * 7.5;
  }, [watchedLoads]);

  // Calculate distribution for display
  const distribution = useMemo(() => {
    if (!watchedLoads || watchedLoads <= 0) return [];
    const dist: {load: number, weight: number}[] = [];
    for (let i = 1; i <= watchedLoads; i++) {
      dist.push({ load: i, weight: 7.5 });
    }
    return dist;
  }, [watchedLoads]);
  
  useEffect(() => {
    const calculatedPrice = watchedLoads ? watchedLoads * 180 : 0;
    if(calculatedPrice > 0){
        form.setValue('total', calculatedPrice);
    } else {
        form.setValue('total', undefined);
    }
  }, [watchedLoads, form]);

  const onSubmit = async (data: ManualOrderFormValues) => {
    setIsSaving(true);
    const initialStatus = 'Order Placed';
    
    // Store multiple employee IDs as JSON array in assigned_employee_ids
    // For backward compatibility, also set assigned_employee_id to first employee or null
    const assignedEmployeeIds = data.assigned_employee_ids || [];
    const firstEmployeeId = assignedEmployeeIds.length > 0 ? assignedEmployeeIds[0] : null;
    
    // Parse the date string to a Date object
    const orderDate = new Date(data.orderDate);
    
    const newOrder: Omit<Order, 'id' | 'userId'> = {
      customerName: data.customerName,
      contactNumber: 'N/A', // Contact will be added in the dashboard
      load: data.loads,
      weight: weight, // Calculate weight from loads (loads * 7.5)
      status: initialStatus,
      total: data.total,
      isPaid: data.isPaid || false,
      servicePackage: 'package1',
      distance: 0,
      orderDate: orderDate,
      statusHistory: [{ status: initialStatus, timestamp: new Date() }],
      assignedEmployeeId: firstEmployeeId, // For backward compatibility
      assignedEmployeeIds: assignedEmployeeIds.length > 0 ? assignedEmployeeIds : undefined, // New field for multiple employees
    };
    await onAddOrder(newOrder);
    setIsSaving(false);
    form.reset({
      customerName: '',
      orderDate: format(new Date(), 'yyyy-MM-dd'), // Reset to today's date
      loads: undefined,
      total: undefined,
      isPaid: undefined,
      assigned_employee_ids: [],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) form.reset(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Create Manual Order
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Fill in the order details below. All fields marked with <span className="text-destructive">*</span> are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="customerName" className="text-sm font-medium mb-2 block">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  {...form.register('customerName')}
                  disabled={isSaving}
                  className="h-11"
                />
                {form.formState.errors.customerName && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.customerName.message}</p>
                )}
              </div>
              
              <div className="form-group">
                <Label htmlFor="orderDate" className="text-sm font-medium mb-2 block">
                  Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="orderDate"
                    type="date"
                    {...form.register('orderDate')}
                    disabled={isSaving}
                    className="h-11 pl-10"
                  />
                </div>
                {form.formState.errors.orderDate && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.orderDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Order Details</h3>
            </div>
            
            <div className="form-group">
              <Label className="text-sm font-medium mb-3 block">
                Number of Loads <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="loads"
                control={form.control}
                render={({ field }) => (
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((loadNum) => {
                      const isSelected = field.value === loadNum;
                      return (
                        <Button
                          key={loadNum}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            field.onChange(loadNum);
                          }}
                          disabled={isSaving}
                          className={cn(
                            "h-12 font-semibold transition-all text-base",
                            isSelected 
                              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md scale-105" 
                              : "hover:border-primary hover:text-primary hover:scale-105"
                          )}
                        >
                          {loadNum}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
              {form.formState.errors.loads && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.loads.message}</p>
              )}
            </div>

            {/* Order Summary Card */}
            {watchedLoads && watchedLoads > 0 && (
              <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Order Summary
                  </h4>
                  <span className="text-xl font-bold text-primary">{watchedLoads} Load{watchedLoads > 1 ? 's' : ''}</span>
                </div>
                <Separator className="bg-primary/20" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Weight</p>
                    <p className="text-base font-semibold text-foreground">{weight.toFixed(1)} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Price per Load</p>
                    <p className="text-base font-semibold text-foreground">₱180</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-primary/20">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-primary">₱{watchedLoads * 180}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <Label htmlFor="total" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Price
              </Label>
              <Controller
                name="total"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    {...field}
                    value={field.value ?? ''}
                    disabled={isSaving}
                    className="h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                )}
              />
              {form.formState.errors.total && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.total.message}</p>
              )}
            </div>
          </div>

          {/* Employee Assignment Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Users className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">
                Assign Employee <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
            </div>
            <Controller
              name="assigned_employee_ids"
              control={form.control}
              render={({ field }) => {
                const selectedIds = field.value || [];
                
                const toggleEmployee = (employeeId: string) => {
                  const currentIds = selectedIds;
                  if (currentIds.includes(employeeId)) {
                    field.onChange(currentIds.filter(id => id !== employeeId));
                  } else {
                    field.onChange([...currentIds, employeeId]);
                  }
                };
                
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {loadingEmployees ? (
                      <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                        Loading employees...
                      </div>
                    ) : employees.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                        No employees available
                      </div>
                    ) : (
                      employees.map((employee) => {
                        const isSelected = selectedIds.includes(employee.id);
                        return (
                          <Button
                            key={employee.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => toggleEmployee(employee.id)}
                            disabled={isSaving || loadingEmployees}
                            className={cn(
                              "h-11 font-medium transition-all",
                              isSelected 
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
                                : "hover:border-primary hover:text-primary"
                            )}
                          >
                            {employee.first_name || 'Employee'}
                          </Button>
                        );
                      })
                    )}
                  </div>
                );
              }}
            />
          </div>

          {/* Payment Status Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">
                Payment Status <span className="text-destructive">*</span>
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => form.setValue('isPaid', true)}
                className={cn(
                  "h-12 font-semibold transition-all",
                  isPaid === true
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:border-green-600'
                )}
                disabled={isSaving}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Paid
              </Button>
              <Button
                type="button"
                onClick={() => form.setValue('isPaid', false)}
                className={cn(
                  "h-12 font-semibold transition-all",
                  isPaid === false
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:border-red-600'
                )}
                disabled={isSaving}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Unpaid
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { form.reset(); onClose(); }} 
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || isPaid === undefined || !!form.formState.errors.loads || !!form.formState.errors.assigned_employee_ids}
              className="w-full sm:w-auto min-w-[120px] bg-primary hover:bg-primary/90 shadow-md"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Creating...' : 'Add Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
