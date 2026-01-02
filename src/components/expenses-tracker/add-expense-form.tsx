"use client";

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { expenseSchema, type ExpenseFormValues } from './types';

interface AddExpenseFormProps {
  form: UseFormReturn<ExpenseFormValues>;
  saving: boolean;
  onSubmit: (data: ExpenseFormValues) => Promise<void>;
}

export function AddExpenseForm({ form, saving, onSubmit }: AddExpenseFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const expenseFor = watch('expense_for');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>Log a new business expense.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid w-full sm:w-48 gap-1.5">
            <Label htmlFor="title">Description</Label>
            <Input 
              id="title" 
              placeholder="e.g., Rent, Supplies" 
              {...register('title', { required: 'Description is required' })} 
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div className="grid w-full sm:w-auto gap-1.5">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              {...register('amount', { required: 'Amount is required', valueAsNumber: true })} 
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>
          
          <div className="grid w-full sm:w-auto gap-1.5">
            <Label htmlFor="category">Category (optional)</Label>
            <Input 
              id="category" 
              placeholder="e.g., utilities" 
              {...register('category')} 
            />
          </div>
          
          <div className="grid w-full sm:w-auto gap-1.5">
            <Label htmlFor="expense_for">Expense By</Label>
            <Select 
              value={expenseFor} 
              onValueChange={(value) => setValue('expense_for', value as 'Racky' | 'Karaya' | 'Richard' | 'RKR')}
            >
              <SelectTrigger id="expense_for" className="w-full sm:w-[140px]">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Racky">Racky</SelectItem>
                <SelectItem value="Karaya">Karaya</SelectItem>
                <SelectItem value="Richard">Richard</SelectItem>
                <SelectItem value="RKR">RKR</SelectItem>
              </SelectContent>
            </Select>
            {errors.expense_for && (
              <p className="text-xs text-destructive">{errors.expense_for.message}</p>
            )}
          </div>
          
          <div className="grid w-full sm:w-auto gap-1.5">
            <Label htmlFor="incurred_on">Date</Label>
            <Input 
              id="incurred_on" 
              type="date" 
              {...register('incurred_on')} 
            />
          </div>
          
          <Button type="submit" className="w-full sm:w-auto">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
