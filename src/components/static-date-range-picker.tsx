'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { X } from 'lucide-react';

type StaticDateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  onCancel?: () => void;
  onConfirm?: (range: DateRange | undefined) => void;
  className?: string;
};

export function StaticDateRangePicker({
  value,
  onChange,
  onCancel,
  onConfirm,
  className,
}: StaticDateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDateRange(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      onChange?.(undefined);
      return;
    }

    // If user clicks the same date twice (from and to are the same), treat as single date
    if (range.from && range.to && isSameDay(range.from, range.to)) {
      const singleDate = { from: range.from, to: undefined };
      setDateRange(singleDate);
      onChange?.(singleDate);
    } else {
      setDateRange(range);
      onChange?.(range);
    }
  };

  const handleCancel = () => {
    setDateRange(undefined);
    onChange?.(undefined);
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm?.(dateRange);
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Select date range';
    
    if (dateRange.to && !isSameDay(dateRange.from, dateRange.to)) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    
    return format(dateRange.from, 'MMM d, yyyy');
  };

  return (
    <div className={`flex flex-col bg-background border rounded-lg shadow-xl overflow-hidden ${className || ''}`}>
      {/* Header Section */}
      <div className="px-5 py-4 border-b bg-muted/20">
        <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          SELECT DATE RANGE
        </div>
        <div className="text-base sm:text-lg font-semibold text-foreground">
          {formatDateRange()}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="p-4 sm:p-5">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={1}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t bg-background gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          className="flex-1 h-9 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="flex-1 h-9 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!dateRange?.from}
        >
          OK
        </Button>
      </div>
    </div>
  );
}
