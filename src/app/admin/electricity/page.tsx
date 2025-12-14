'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ElectricityTracker } from '@/components/electricity-tracker';

export default function AdminElectricityPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Electricity</CardTitle>
        <CardDescription>
          Track daily electricity consumption readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ElectricityTracker />
      </CardContent>
    </Card>
  );
}

