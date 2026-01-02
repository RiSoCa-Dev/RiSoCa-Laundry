"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseSummaryCardProps {
  rackyTotal: number;
  karayaTotal: number;
  richardTotal: number;
  rkrTotal: number;
  reimbursedTotal: number;
  totalExpenses: number;
}

export function ExpenseSummaryCard({
  rackyTotal,
  karayaTotal,
  richardTotal,
  rkrTotal,
  reimbursedTotal,
  totalExpenses,
}: ExpenseSummaryCardProps) {
  return (
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
  );
}
