'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Inbox, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { format, startOfDay } from 'date-fns';

type Order = {
  id: string;
  customer_name: string;
  contact_number: string;
  loads: number;
  weight: number;
  total: number;
  is_paid: boolean;
  created_at: string;
};

type CustomerTransaction = {
  date: Date;
  loads: number;
  weight: number;
  amountPaid: number;
  orderId: string;
};

type CustomerData = {
  name: string;
  contactNumber: string;
  visits: number;
  totalLoads: number;
  totalWeight: number;
  totalAmountPaid: number;
  transactions: CustomerTransaction[];
};

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, contact_number, loads, weight, total, is_paid, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load orders', error);
        toast({
          variant: 'destructive',
          title: 'Load error',
          description: 'Could not load customer data.',
        });
        setLoading(false);
        return;
      }

      setOrders((data ?? []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch customer data.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Group customers by name and calculate aggregates
  const customers = useMemo(() => {
    const customerMap = new Map<string, CustomerData>();

    orders.forEach((order) => {
      const customerName = order.customer_name || 'Unknown';
      const contactNumber = order.contact_number || '';
      
      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          name: customerName,
          contactNumber: contactNumber,
          visits: 0,
          totalLoads: 0,
          totalWeight: 0,
          totalAmountPaid: 0,
          transactions: [],
        });
      }

      const customer = customerMap.get(customerName)!;
      const orderDate = startOfDay(new Date(order.created_at));
      const amountPaid = order.is_paid ? order.total : 0;

      // Check if this is a unique visit date
      const isNewVisit = !customer.transactions.some(
        (t) => startOfDay(t.date).getTime() === orderDate.getTime()
      );

      if (isNewVisit) {
        customer.visits += 1;
      }

      customer.totalLoads += order.loads || 0;
      customer.totalWeight += order.weight || 0;
      customer.totalAmountPaid += amountPaid;

      customer.transactions.push({
        date: new Date(order.created_at),
        loads: order.loads || 0,
        weight: order.weight || 0,
        amountPaid: amountPaid,
        orderId: order.id,
      });
    });

    // Sort transactions by date (newest first) for each customer
    customerMap.forEach((customer) => {
      customer.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    // Convert to array and sort by customer name
    return Array.from(customerMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [orders]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          View all customers and their transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Loading customer data...</p>
          </div>
        ) : customers.length > 0 ? (
          <div className="space-y-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Customer Name</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                    <TableHead className="text-center">Total Loads</TableHead>
                    <TableHead className="text-right">Total Weight (kg)</TableHead>
                    <TableHead className="text-right">Total Amount Paid</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Accordion type="single" collapsible className="w-full">
                    {customers.map((customer) => (
                      <AccordionItem
                        key={customer.name}
                        value={customer.name}
                        className="border-none"
                      >
                        <>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {customer.name}
                              {customer.contactNumber && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {customer.contactNumber}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.visits}
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.totalLoads}
                            </TableCell>
                            <TableCell className="text-right">
                              {customer.totalWeight.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₱{customer.totalAmountPaid.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {customer.transactions.length > 1 && (
                                <AccordionTrigger className="h-8 w-8 p-0 hover:no-underline">
                                  <ChevronDown className="h-4 w-4" />
                                </AccordionTrigger>
                              )}
                            </TableCell>
                          </TableRow>
                          {customer.transactions.length > 1 && (
                            <AccordionContent asChild>
                              <TableRow>
                                <TableCell colSpan={6} className="p-0 bg-muted/30">
                                  <div className="p-4">
                                    <h4 className="text-sm font-semibold mb-3">
                                      Transaction History ({customer.transactions.length} orders)
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b">
                                        <div>Date</div>
                                        <div className="text-center">Loads</div>
                                        <div className="text-right">Weight (kg)</div>
                                        <div className="text-right">Amount Paid</div>
                                        <div className="text-center">Order ID</div>
                                      </div>
                                      {customer.transactions.map((transaction, idx) => (
                                        <div
                                          key={`${transaction.orderId}-${idx}`}
                                          className="grid grid-cols-5 gap-4 text-sm py-2 border-b last:border-0"
                                        >
                                          <div>
                                            {format(transaction.date, 'MMM dd, yyyy')}
                                          </div>
                                          <div className="text-center">
                                            {transaction.loads}
                                          </div>
                                          <div className="text-right">
                                            {transaction.weight.toFixed(2)}
                                          </div>
                                          <div className="text-right font-medium">
                                            ₱{transaction.amountPaid.toFixed(2)}
                                          </div>
                                          <div className="text-center text-xs text-muted-foreground">
                                            {transaction.orderId}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </AccordionContent>
                          )}
                        </>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2" />
            <p>No customers found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

