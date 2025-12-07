
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Order = {
  id: string;
  customer: string;
  contact: string;
  load: number;
  weight: number;
  status: string;
  total: number;
};

type OrderListProps = {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => void;
};

const statusOptions = [
  'Order Placed',
  'Pickup Scheduled',
  'Washing',
  'Drying',
  'Folding',
  'Ready for Pick Up',
  'Out for Delivery',
  'Delivered',
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-500';
    case 'Out for Delivery':
    case 'Ready for Pick Up':
      return 'bg-blue-500';
    case 'Washing':
    case 'Drying':
    case 'Folding':
      return 'bg-yellow-500';
    case 'Pickup Scheduled':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

export function OrderList({ orders, onStatusChange }: OrderListProps) {
  return (
    <>
      {/* Mobile View - Card List */}
      <div className="md:hidden">
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="w-full">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{order.id}</CardTitle>
                <Badge className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)} text-white`}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Customer Name:</span> {order.customer}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Contact #:</span> {order.contact}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div><span className="font-semibold text-foreground">Load:</span> {order.load}</div>
                  <div><span className="font-semibold text-foreground">Weight:</span> {order.weight} kg</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Total:</span> ₱{order.total.toFixed(2)}
                </div>
                 <Select
                    value={order.status}
                    onValueChange={(newStatus) => onStatusChange(order.id, newStatus)}
                  >
                    <SelectTrigger className="w-full h-10 mt-2">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Load</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.contact}</TableCell>
                <TableCell>{order.load}</TableCell>
                <TableCell>{order.weight.toFixed(2)}</TableCell>
                <TableCell>₱{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)} text-white`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) => onStatusChange(order.id, newStatus)}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Update Status" />
                    </Trigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
