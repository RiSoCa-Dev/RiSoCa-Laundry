
"use client";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shirt, Truck, PackageCheck, CircleCheck, Wind, WashingMachine } from 'lucide-react';

const statuses = [
  { name: 'Order Placed', icon: CircleCheck, duration: 2000 },
  { name: 'Pickup Scheduled', icon: Truck, duration: 4000 },
  { name: 'Washing', icon: WashingMachine, duration: 6000 },
  { name: 'Drying', icon: Wind, duration: 5000 },
  { name: 'Folding', icon: Shirt, duration: 5000 },
  { name: 'Out for Delivery', icon: Truck, duration: 4000 },
  { name: 'Delivered', icon: PackageCheck, duration: 0 },
];

type StatusLog = {
  status: string;
  timestamp: string;
};

export function OrderStatusTracker() {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect runs only once on mount to simulate a single order's lifecycle.
    // To track a new order, this component would need to be re-mounted or reset.
    const firstLog = { 
      status: statuses[0].name, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setStatusLogs([firstLog]);
    setProgress((1 / statuses.length) * 100);

    let currentIndex = 0;
    const scheduleNextUpdate = () => {
      if (currentIndex >= statuses.length - 1) return;

      const delay = statuses[currentIndex].duration;
      
      const timer = setTimeout(() => {
        currentIndex++;
        const nextStatus = statuses[currentIndex];
        setStatusLogs(prev => [
          ...prev, 
          { 
            status: nextStatus.name, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setCurrentStatusIndex(currentIndex);
        setProgress(((currentIndex + 1) / statuses.length) * 100);
        scheduleNextUpdate();
      }, delay);

      return () => clearTimeout(timer);
    };
    
    scheduleNextUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CurrentIcon = statuses[currentStatusIndex].icon;

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Real-Time Order Tracking</CardTitle>
        <CardDescription>Your laundry is in good hands. Track its journey below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-primary">{statuses[currentStatusIndex].name}</h3>
              <CurrentIcon className="h-8 w-8 text-primary" />
            </div>
            <Progress value={progress} className="w-full h-3 [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-1000" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Order Placed</span>
              <span>Delivered</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground/80">Status Log</h4>
            <div className="max-h-72 overflow-y-auto pr-2 -mr-4">
              <ul className="space-y-4 border-l-2 border-dashed border-border ml-2">
                {statusLogs.slice().reverse().map((log, index) => (
                  <li key={index} className="flex items-start gap-4 -ml-[11px] relative">
                    <div className={`flex-shrink-0 mt-1.5 rounded-full h-5 w-5 flex items-center justify-center ${index === 0 ? 'bg-primary' : 'bg-muted'}`}>
                       <div className="h-2 w-2 rounded-full bg-card"></div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className={`font-medium ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{log.status}</p>
                      <p className="text-sm text-muted-foreground">{log.timestamp}</p>
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
