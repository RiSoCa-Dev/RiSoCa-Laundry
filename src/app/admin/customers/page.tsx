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

      // Update contact number: prefer non-empty, and if both are non-empty, use the most recent
      if (contactNumber) {
        if (!customer.contactNumber) {
          // If current is empty, use this one
          customer.contactNumber = contactNumber;
        } else {
          // If both have values, use the most recent one
          const currentOrderDate = customer.transactions.length > 0 
            ? new Date(customer.transactions[0].date) 
            : new Date(0);
          if (new Date(order.created_at) > currentOrderDate) {
            customer.contactNumber = contactNumber;
          }
        }
      }

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
    // Also update contact number to the most recent non-empty one
    customerMap.forEach((customer) => {
      customer.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      // Find the most recent contact number from orders
      const customerOrders = orders.filter(o => (o.customer_name || 'Unknown') === customer.name);
      const ordersWithContact = customerOrders
        .filter(o => o.contact_number)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (ordersWithContact.length > 0) {
        customer.contactNumber = ordersWithContact[0].contact_number || '';
      }
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
          <div className="w-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] sm:min-w-[200px] px-4 text-left">Customer Name</TableHead>
                    <TableHead className="text-center px-4 w-[80px]">Visits</TableHead>
                    <TableHead className="text-center px-4 w-[100px]">Total Loads</TableHead>
                    <TableHead className="text-right px-4 whitespace-nowrap min-w-[120px]">Total Weight (kg)</TableHead>
                    <TableHead className="text-right px-4 whitespace-nowrap min-w-[140px]">Total Amount Paid</TableHead>
                    <TableHead className="w-[60px] px-4"></TableHead>
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
                            <TableCell className="font-medium min-w-[150px] sm:min-w-[200px] px-4 text-left align-top">
                              <div className="flex flex-col">
                                <span className="break-words">{customer.name}</span>
                                {customer.contactNumber ? (
                                  <span className="text-xs text-muted-foreground mt-0.5 break-words">
                                    {customer.contactNumber}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-4 w-[80px] align-middle">
                              {customer.visits}
                            </TableCell>
                            <TableCell className="text-center px-4 w-[100px] align-middle">
                              {customer.totalLoads}
                            </TableCell>
                            <TableCell className="text-right px-4 whitespace-nowrap min-w-[120px] align-middle">
                              {customer.totalWeight.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right px-4 whitespace-nowrap min-w-[140px] font-semibold align-middle">
                              ₱{customer.totalAmountPaid.toFixed(2)}
                            </TableCell>
                            <TableCell className="w-[60px] px-4 align-middle">
                              {customer.transactions.length > 1 && (
                                <AccordionTrigger className="h-8 w-8 p-0 hover:no-underline mx-auto">
                                  <ChevronDown className="h-4 w-4" />
                                </AccordionTrigger>
                              )}
                            </TableCell>
                          </TableRow>
                          {customer.transactions.length > 1 && (
                            <AccordionContent asChild>
                              <TableRow>
                                <TableCell colSpan={6} className="p-0 bg-muted/30">
                                  <div className="p-3 sm:p-4">
                                    <h4 className="text-sm font-semibold mb-3">
                                      Transaction History ({customer.transactions.length} orders)
                                    </h4>
                                    <div className="space-y-2 overflow-x-auto">
                                      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs font-medium text-muted-foreground pb-2 border-b min-w-[600px] sm:min-w-0">
                                        <div className="min-w-[90px] sm:min-w-[100px]">Date</div>
                                        <div className="text-center min-w-[50px]">Loads</div>
                                        <div className="text-right whitespace-nowrap min-w-[80px]">Weight (kg)</div>
                                        <div className="text-right whitespace-nowrap min-w-[90px]">Amount Paid</div>
                                        <div className="text-center min-w-[90px] sm:min-w-[100px]">Order ID</div>
                                      </div>
                                      {customer.transactions.map((transaction, idx) => (
                                        <div
                                          key={`${transaction.orderId}-${idx}`}
                                          className="grid grid-cols-5 gap-2 sm:gap-4 text-sm py-2 border-b last:border-0 min-w-[600px] sm:min-w-0"
                                        >
                                          <div className="min-w-[90px] sm:min-w-[100px] break-words">
                                            {format(transaction.date, 'MMM dd, yyyy')}
                                          </div>
                                          <div className="text-center min-w-[50px]">
                                            {transaction.loads}
                                          </div>
                                          <div className="text-right whitespace-nowrap min-w-[80px]">
                                            {transaction.weight.toFixed(2)}
                                          </div>
                                          <div className="text-right font-medium whitespace-nowrap min-w-[90px]">
                                            ₱{transaction.amountPaid.toFixed(2)}
                                          </div>
                                          <div className="text-center text-xs text-muted-foreground min-w-[90px] sm:min-w-[100px] break-all">
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

