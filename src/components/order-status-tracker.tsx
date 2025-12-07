
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
      <CardHeader className="p-4">
        <CardTitle className="text-xl">Real-Time Order Tracking</CardTitle>
        <CardDescription className="text-xs">Track your laundry's journey below.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-base text-primary">{statuses[currentStatusIndex].name}</h3>
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
