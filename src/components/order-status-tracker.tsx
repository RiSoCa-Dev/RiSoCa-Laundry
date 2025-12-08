"use client";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shirt, Truck, PackageCheck, CircleCheck, Wind, WashingMachine, Package, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/components/order-list';

const statuses = [
  { name: 'Order Placed', icon: CircleCheck },
  { name: 'Pickup Scheduled', icon: Truck },
  { name: 'Washing', icon: WashingMachine },
  { name: 'Drying', icon: Wind },
  { name: 'Folding', icon: Shirt },
  { name: 'Ready for Pick Up', icon: Package },
  { name: 'Out for Delivery', icon: Truck },
  { name: 'Delivered', icon: PackageCheck },
  { name: 'Success', icon: CheckCircle2 },
];

type StatusLog = {
  status: string;
  timestamp: string;
};

export function OrderStatusTracker({ order }: { order: Order }) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const orderStatusIndex = statuses.findIndex(s => s.name === order.status);
    
    if (orderStatusIndex !== -1) {
      setCurrentStatusIndex(orderStatusIndex);
      
      const logs = statuses.slice(0, orderStatusIndex + 1).map(s => ({
        status: s.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setStatusLogs(logs);

      setProgress(((orderStatusIndex + 1) / statuses.length) * 100);
    }
  }, [order]);

  const CurrentIcon = statuses[currentStatusIndex]?.icon || CircleCheck;

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="p-4">
        <CardTitle className="text-xl">Real-Time Order Tracking</CardTitle>
        <CardDescription className="text-xs">
          Tracking ID: <span className="font-semibold text-primary">{order.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-base text-primary">{statuses[currentStatusIndex]?.name}</h3>
              <CurrentIcon className="h-6 w-6 text-primary" />
            </div>
            <Progress value={progress} className="w-full h-2 [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-1000" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Placed</span>
              <span>Delivered</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground/80">Status Log</h4>
            <div className="max-h-60 overflow-y-auto pr-2 -mr-2">
              <ul className="space-y-3 border-l-2 border-dashed border-border ml-2">
                {statusLogs.slice().reverse().map((log, index) => (
                  <li key={index} className="flex items-start gap-3 -ml-[10px] relative">
                    <div className={`flex-shrink-0 mt-1 rounded-full h-4 w-4 flex items-center justify-center ${index === 0 ? 'bg-primary' : 'bg-muted'}`}>
                       <div className="h-1.5 w-1.5 rounded-full bg-card"></div>
                    </div>
                    <div className="flex-1 pt-0">
                      <p className={`font-medium text-xs ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{log.status}</p>
                      <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
