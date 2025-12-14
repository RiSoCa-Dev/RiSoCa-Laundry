'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Inbox, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  addElectricityReading,
  deleteElectricityReading,
  fetchElectricityReadings,
  type ElectricityReading,
} from '@/lib/api/electricity';
import { useAuthSession } from '@/hooks/use-auth-session';

const electricitySchema = z.object({
  reading: z.coerce.number().min(0, 'Reading must be greater than or equal to 0'),
  reading_date: z.string().min(1, 'Date is required'),
});

type ElectricityFormData = z.infer<typeof electricitySchema>;

export function ElectricityTracker() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();
  const [readings, setReadings] = useState<ElectricityReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ElectricityFormData>({
    resolver: zodResolver(electricitySchema),
    defaultValues: {
      reading: 0,
      reading_date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    },
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await fetchElectricityReadings();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Load failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }
    setReadings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onAddReading = async (data: ElectricityFormData) => {
    if (authLoading || !user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'Admin sign-in required.',
      });
      return;
    }
    setSaving(true);
    const { error } = await addElectricityReading({
      reading: data.reading,
      reading_date: data.reading_date,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message,
      });
      setSaving(false);
      return;
    }
    toast({
      title: 'Reading Added',
      description: `Electricity reading of ${data.reading} kWh for ${format(new Date(data.reading_date), 'MMM dd, yyyy')} has been recorded.`,
    });
    reset();
    setIsDialogOpen(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteElectricityReading(id);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message,
      });
      return;
    }
    toast({
      variant: 'destructive',
      title: 'Reading Removed',
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Electricity Reading</DialogTitle>
              <DialogDescription>
                Enter the electricity meter reading and date
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddReading)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reading_date">Date</Label>
                <Input
                  id="reading_date"
                  type="date"
                  {...register('reading_date')}
                  disabled={saving}
                />
                {errors.reading_date && (
                  <p className="text-sm text-red-500">
                    {errors.reading_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading">Reading (kWh)</Label>
                <Input
                  id="reading"
                  type="number"
                  step="0.01"
                  placeholder="17.01"
                  {...register('reading')}
                  disabled={saving}
                />
                {errors.reading && (
                  <p className="text-sm text-red-500">
                    {errors.reading.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    reset();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
          <Loader2 className="h-12 w-12 mb-2 animate-spin" />
          <p>Loading electricity readings...</p>
        </div>
      ) : readings.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Reading (kWh)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>
                    {format(new Date(reading.reading_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {reading.reading.toFixed(2)} kWh
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reading.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mb-2" />
          <p>No electricity readings recorded yet.</p>
        </div>
      )}
    </div>
  );
}

