'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Inbox, Loader2, Edit2, Check, X, CheckCircle2, Clock, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { addExpense, deleteExpense, fetchExpenses, updateExpense, reimburseExpense, bulkReimburseExpenses, getPendingReimbursements } from '@/lib/api/expenses';
import { useAuthSession } from '@/hooks/use-auth-session';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const expenseSchema = z.object({
  title: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().optional(),
  expense_for: z.enum(['Racky', 'Karaya', 'Richard', 'RKR'], {
    required_error: 'Please select who this expense is for',
  }),
  incurred_on: z.string().optional(),
});

type FilterType = 'all' | 'pending' | 'reimbursed' | 'rkr';

export function ExpensesTracker() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingDateValue, setEditingDateValue] = useState<string>('');
  const [savingDate, setSavingDate] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [reimbursing, setReimbursing] = useState<string | null>(null);
  const [bulkReimbursing, setBulkReimbursing] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<{ Racky: number; Karaya: number; Richard: number; total: number } | null>(null);
  const [reimburseDialogOpen, setReimburseDialogOpen] = useState(false);
  const [expenseToReimburse, setExpenseToReimburse] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      expense_for: 'RKR',
      incurred_on: new Date().toISOString().slice(0, 10)
    }
  });

  const expenseFor = watch('expense_for');

  const load = async () => {
    setLoading(true);
    const { data, error } = await fetchExpenses();
    if (error) {
      toast({ variant: 'destructive', title: 'Load failed', description: error.message });
      setLoading(false);
      return;
    }
    setExpenses((data ?? []).map(e => ({ ...e, date: new Date(e.incurred_on ?? e.created_at) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    loadPendingSummary();
  }, []);

  const loadPendingSummary = async () => {
    const { data } = await getPendingReimbursements();
    if (data) {
      setPendingSummary(data);
    }
  };

  const onAddExpense = async (data: z.infer<typeof expenseSchema>) => {
    if (authLoading || !user) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'Admin sign-in required.' });
      return;
    }
    setSaving(true);
    const { error } = await addExpense({
      title: data.title,
      amount: data.amount,
      category: data.category ?? null,
      expense_for: data.expense_for,
      incurred_on: data.incurred_on || new Date().toISOString().slice(0, 10),
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message });
      setSaving(false);
      return;
    }
    toast({ title: 'Expense Added', description: `${data.title} has been logged.` });
    reset();
    setSaving(false);
    load();
    loadPendingSummary();
  };

  const handleDelete = async (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense?.reimbursement_status === 'reimbursed') {
      const confirmed = window.confirm('This expense was reimbursed. Are you sure you want to delete it?');
      if (!confirmed) return;
    }
    const { error } = await deleteExpense(id);
    if (error) {
      toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
      return;
    }
    toast({ variant: 'destructive', title: 'Expense Removed' });
    load();
    loadPendingSummary();
  };

  const handleReimburse = async (expense: any) => {
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found' });
      return;
    }
    setReimbursing(expense.id);
    const { error } = await reimburseExpense(expense.id, user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Reimbursement failed', description: error.message });
      setReimbursing(null);
      return;
    }
    toast({ title: 'Expense Reimbursed', description: `${expense.title} has been transferred to RKR.` });
    setReimbursing(null);
    setReimburseDialogOpen(false);
    setExpenseToReimburse(null);
    load();
    loadPendingSummary();
  };

  const handleBulkReimburse = async () => {
    if (selectedExpenses.size === 0) {
      toast({ variant: 'destructive', title: 'No selection', description: 'Please select expenses to reimburse.' });
      return;
    }
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found' });
      return;
    }
    setBulkReimbursing(true);
    const expenseIds = Array.from(selectedExpenses);
    const { error } = await bulkReimburseExpenses(expenseIds, user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Bulk reimbursement failed', description: error.message });
      setBulkReimbursing(false);
      return;
    }
    toast({ title: 'Expenses Reimbursed', description: `${expenseIds.length} expense(s) have been transferred to RKR.` });
    setBulkReimbursing(false);
    setSelectedExpenses(new Set());
    load();
    loadPendingSummary();
  };

  const toggleExpenseSelection = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  const toggleSelectAll = () => {
    const pendingInFiltered = filteredExpenses.filter(e => e.reimbursement_status === 'pending');
    if (selectedExpenses.size === pendingInFiltered.length && pendingInFiltered.length > 0) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(pendingInFiltered.map(e => e.id)));
    }
  };

  const handleStartEditDate = (expense: any) => {
    setEditingDateId(expense.id);
    setEditingDateValue(expense.incurred_on || new Date(expense.date).toISOString().slice(0, 10));
  };

  const handleCancelEditDate = () => {
    setEditingDateId(null);
    setEditingDateValue('');
  };

  const handleSaveDate = async (id: string) => {
    if (!editingDateValue) {
      toast({ variant: 'destructive', title: 'Date required', description: 'Please enter a valid date.' });
      return;
    }
    setSavingDate(true);
    const { error } = await updateExpense(id, { incurred_on: editingDateValue });
    if (error) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      setSavingDate(false);
      return;
    }
    toast({ title: 'Date Updated', description: 'Expense date has been updated.' });
    setEditingDateId(null);
    setEditingDateValue('');
    setSavingDate(false);
    load();
  };

  // Filter expenses based on selected filter
  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    if (filter === 'pending') return expense.reimbursement_status === 'pending';
    if (filter === 'reimbursed') return expense.reimbursement_status === 'reimbursed';
    if (filter === 'rkr') return expense.expense_for === 'RKR' && expense.reimbursement_status !== 'reimbursed';
    return true;
  });

  // Calculate totals - separate pending vs reimbursed
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Pending reimbursements (personal expenses not yet reimbursed)
  const pendingExpenses = expenses.filter(e => e.reimbursement_status === 'pending');
  const pendingTotal = pendingExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Reimbursed expenses (now counted as RKR)
  const reimbursedExpenses = expenses.filter(e => e.reimbursement_status === 'reimbursed');
  const reimbursedTotal = reimbursedExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Calculate totals per person (current expense_for, so reimbursed show as RKR)
  const totalsByPerson = expenses.reduce((acc, exp) => {
    const person = exp.expense_for || 'Unknown';
    acc[person] = (acc[person] || 0) + (exp.amount ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const rackyTotal = totalsByPerson['Racky'] || 0;
  const karayaTotal = totalsByPerson['Karaya'] || 0;
  const richardTotal = totalsByPerson['Richard'] || 0;
  const rkrTotal = totalsByPerson['RKR'] || 0;

  // Get pending totals from summary or calculate
  const pendingRacky = pendingSummary?.Racky || pendingExpenses.filter(e => e.expense_for === 'Racky').reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingKaraya = pendingSummary?.Karaya || pendingExpenses.filter(e => e.expense_for === 'Karaya').reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingRichard = pendingSummary?.Richard || pendingExpenses.filter(e => e.expense_for === 'Richard').reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>Log a new business expense.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onAddExpense)} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="grid w-full sm:w-48 gap-1.5">
                        <Label htmlFor="title">Description</Label>
                        <Input id="title" placeholder="e.g., Rent, Supplies" {...register('title', { required: 'Description is required' })} />
                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>
                    <div className="grid w-full sm:w-auto gap-1.5">
                        <Label htmlFor="amount">Amount (₱)</Label>
                        <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount', { required: 'Amount is required', valueAsNumber: true })} />
                        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                    </div>
                    <div className="grid w-full sm:w-auto gap-1.5">
                        <Label htmlFor="category">Category (optional)</Label>
                        <Input id="category" placeholder="e.g., utilities" {...register('category')} />
                    </div>
                    <div className="grid w-full sm:w-auto gap-1.5">
                        <Label htmlFor="expense_for">Expense By</Label>
                        <Select value={expenseFor} onValueChange={(value) => setValue('expense_for', value as 'Racky' | 'Karaya' | 'Richard' | 'RKR')}>
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
                        {errors.expense_for && <p className="text-xs text-destructive">{errors.expense_for.message}</p>}
                    </div>
                    <div className="grid w-full sm:w-auto gap-1.5">
                        <Label htmlFor="incurred_on">Date</Label>
                        <Input id="incurred_on" type="date" {...register('incurred_on')} />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* Pending Reimbursements Summary Card */}
        {pendingTotal > 0 && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Pending Reimbursements
                  </CardTitle>
                  <CardDescription>Personal expenses awaiting reimbursement</CardDescription>
                </div>
                {selectedExpenses.size > 0 && (
                  <Button
                    onClick={handleBulkReimburse}
                    disabled={bulkReimbursing}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {bulkReimbursing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Reimburse Selected ({selectedExpenses.size})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Racky</div>
                  <div className="font-bold text-orange-700 dark:text-orange-400">₱{pendingRacky.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Karaya</div>
                  <div className="font-bold text-orange-700 dark:text-orange-400">₱{pendingKaraya.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Richard</div>
                  <div className="font-bold text-orange-700 dark:text-orange-400">₱{pendingRichard.toFixed(2)}</div>
                </div>
                <div className="space-y-1 border-l pl-4">
                  <div className="text-xs text-muted-foreground">Total Pending</div>
                  <div className="font-bold text-lg text-orange-700 dark:text-orange-400">₱{pendingTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Summary Card */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
              <CardDescription>All expenses including reimbursed (now counted as RKR)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Racky:</span>
                  <span className="font-bold text-primary">₱{rackyTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Karaya:</span>
                  <span className="font-bold text-primary">₱{karayaTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Richard:</span>
                  <span className="font-bold text-primary">₱{richardTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">RKR:</span>
                  <span className="font-bold text-orange-600">₱{rkrTotal.toFixed(2)}</span>
                </div>
                {reimbursedTotal > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Reimbursed:</span>
                    <span className="font-bold text-green-600">₱{reimbursedTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto border-l pl-4">
                  <span className="font-semibold text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg text-primary">₱{totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Expense Log</CardTitle>
                    <CardDescription>A list of all recorded expenses.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter expenses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Expenses</SelectItem>
                        <SelectItem value="pending">Pending Reimbursements</SelectItem>
                        <SelectItem value="reimbursed">Reimbursed</SelectItem>
                        <SelectItem value="rkr">Business Expenses (RKR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                  <p>Loading expenses...</p>
                </div>
              ) : filteredExpenses.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollable">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted">
                        <TableRow>
                            {filter === 'pending' && (
                              <TableHead className="w-12">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={toggleSelectAll}
                                >
                                  {selectedExpenses.size === pendingInFilteredCount && pendingInFilteredCount > 0 ? (
                                    <CheckSquare className="h-4 w-4" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableHead>
                            )}
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Who</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredExpenses.map((expense) => {
                          const isPending = expense.reimbursement_status === 'pending';
                          const isReimbursed = expense.reimbursement_status === 'reimbursed';
                          const isSelected = selectedExpenses.has(expense.id);
                          const canReimburse = isPending && user;
                          
                          return (
                            <TableRow 
                              key={expense.id}
                              className={`
                                ${isPending ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''}
                                ${isReimbursed ? 'bg-green-50/50 dark:bg-green-950/10' : ''}
                                ${isSelected ? 'ring-2 ring-orange-500' : ''}
                              `}
                            >
                            {filter === 'pending' && (
                              <TableCell>
                                {isPending ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => toggleExpenseSelection(expense.id)}
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="h-4 w-4 text-orange-600" />
                                    ) : (
                                      <Square className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : null}
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              {editingDateId === expense.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="date"
                                    value={editingDateValue}
                                    onChange={(e) => setEditingDateValue(e.target.value)}
                                    className="h-8 w-[140px] text-xs"
                                    disabled={savingDate}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleSaveDate(expense.id)}
                                    disabled={savingDate}
                                  >
                                    {savingDate ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3 text-green-600" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCancelEditDate}
                                    disabled={savingDate}
                                  >
                                    <X className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span>{format(new Date(expense.incurred_on ?? expense.date), 'PPP')}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleStartEditDate(expense)}
                                  >
                                    <Edit2 className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{expense.title}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{expense.category || '—'}</TableCell>
                            <TableCell className="font-medium">{expense.expense_for || '—'}</TableCell>
                            <TableCell>
                              {isPending && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Awaiting reimbursement</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {isReimbursed && expense.reimbursed_at && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Reimbursed
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Reimbursed on {format(new Date(expense.reimbursed_at), 'PPP')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {!isPending && !isReimbursed && expense.expense_for === 'RKR' && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Business
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">₱{Number(expense.amount).toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                {canReimburse && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => {
                                            setExpenseToReimburse(expense);
                                            setReimburseDialogOpen(true);
                                          }}
                                          disabled={reimbursing === expense.id}
                                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                          {reimbursing === expense.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reimburse expense</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(expense.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                            </TableRow>
                        );
                        })}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-2" />
                  <p>
                    {filter === 'all' && 'No expenses have been logged yet.'}
                    {filter === 'pending' && 'No pending reimbursements.'}
                    {filter === 'reimbursed' && 'No reimbursed expenses.'}
                    {filter === 'rkr' && 'No business expenses (RKR).'}
                  </p>
                </div>
              )}
            </CardContent>
        </Card>

        {/* Reimburse Confirmation Dialog */}
        <Dialog open={reimburseDialogOpen} onOpenChange={setReimburseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reimburse Expense</DialogTitle>
              <DialogDescription>
                Mark this expense as reimbursed? It will be transferred to RKR and counted as a business expense.
              </DialogDescription>
            </DialogHeader>
            {expenseToReimburse && (
              <div className="py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <span className="text-sm font-medium">{expenseToReimburse.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">₱{Number(expenseToReimburse.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expense By:</span>
                  <span className="text-sm font-medium">{expenseToReimburse.expense_for}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setReimburseDialogOpen(false);
                setExpenseToReimburse(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => expenseToReimburse && handleReimburse(expenseToReimburse)}
                disabled={reimbursing === expenseToReimburse?.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {reimbursing === expenseToReimburse?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Reimbursement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
