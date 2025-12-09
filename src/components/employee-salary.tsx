'use client';

import { useState } from 'react';
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
  TableFooter
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Inbox, Calendar as CalendarIcon } from 'lucide-react';
import type { Order } from '@/components/order-list';
import { format, startOfDay } from 'date-fns';

// Mock data, as Firebase is removed
const mockOrders: Order[] = [
    { id: 'ORD123', userId: 'user1', customerName: 'John Doe', contactNumber: '09123456789', load: 1, weight: 7.5, status: 'Success', total: 180, orderDate: new Date(), servicePackage: 'package1', distance: 0 },
    { id: 'ORD124', userId: 'user2', customerName: 'Jane Smith', contactNumber: '09987654321', load: 2, weight: 15, status: 'Success', total: 360, orderDate: new Date(), servicePackage: 'package1', distance: 0 },
    { id: 'ORD125', userId: 'user3', customerName: 'Peter Jones', contactNumber: '09171234567', load: 1, weight: 8, status: 'Delivered', total: 180, orderDate: new Date(new Date().setDate(new Date().getDate() - 1)), servicePackage: 'package1', distance: 0 },
    { id: 'ORD126', userId: 'user4', customerName: 'Mary Anne', contactNumber: '09281234567', load: 3, weight: 22, status: 'Washing', total: 540, orderDate: new Date(), servicePackage: 'package1', distance: 0 },
];

const SALARY_PER_LOAD = 30;

export function EmployeeSalary() {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const completedOrders = orders.filter(
    (order) => (order.status === 'Success' || order.status === 'Delivered') &&
               startOfDay(order.orderDate).getTime() === startOfDay(selectedDate).getTime()
  );

  const totalLoads = completedOrders.reduce((acc, order) => acc + order.load, 0);
  const totalSalary = totalLoads * SALARY_PER_LOAD;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <CardTitle>Daily Salary Calculation</CardTitle>
          <CardDescription>Salary is calculated at ₱{SALARY_PER_LOAD} per completed load for the selected day.</CardDescription>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className="w-full md:w-auto justify-start text-left font-normal"
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                initialFocus
                />
            </PopoverContent>
        </Popover>
        <div className="text-right flex-shrink-0 bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Salary for {format(selectedDate, "MMM d")}</div>
            <div className="text-2xl font-bold text-primary">₱{totalSalary.toFixed(2)}</div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Loading orders...</p>
          </div>
        ) : completedOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Loads</TableHead>
                <TableHead className="text-right">Salary Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-center">{order.load}</TableCell>
                  <TableCell className="text-right">₱{(order.load * SALARY_PER_LOAD).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-center font-bold">{totalLoads}</TableCell>
                    <TableCell className="text-right font-bold">₱{totalSalary.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2" />
            <p>No completed orders found for {format(selectedDate, "PPP")}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
