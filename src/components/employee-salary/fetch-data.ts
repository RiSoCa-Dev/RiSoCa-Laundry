import { supabase } from '@/lib/supabase-client';
import type { Order } from '@/components/order-list';
import type { DailyPaymentStatus } from './types';

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_type, assigned_employee_id, assigned_employee_ids');
  
  if (error) {
    console.error("Failed to load orders", error);
    throw error;
  }
  
  const mapped: Order[] = (data ?? []).map(o => ({
    id: o.id,
    userId: o.customer_id,
    customerName: o.customer_name,
    contactNumber: o.contact_number,
    load: o.loads,
    weight: o.weight,
    status: o.status,
    total: o.total,
    orderDate: new Date(o.created_at),
    isPaid: o.is_paid,
    deliveryOption: o.delivery_option ?? undefined,
    servicePackage: o.service_package,
    distance: o.distance ?? 0,
    statusHistory: [],
    orderType: o.order_type || 'customer',
    assignedEmployeeId: o.assigned_employee_id ?? null,
    assignedEmployeeIds: Array.isArray(o.assigned_employee_ids) 
      ? o.assigned_employee_ids 
      : (o.assigned_employee_ids ? [o.assigned_employee_ids] : undefined),
  }));
  
  return mapped;
}

export async function fetchAllDailyPayments(): Promise<Record<string, DailyPaymentStatus>> {
  const { data, error } = await supabase
    .from('daily_salary_payments')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to load all daily payments", error);
    return {};
  }

  const paymentsByDate: Record<string, DailyPaymentStatus> = {};
  (data || []).forEach((payment: any) => {
    const dateStr = payment.date;
    if (!paymentsByDate[dateStr]) {
      paymentsByDate[dateStr] = {};
    }
    paymentsByDate[dateStr][payment.employee_id] = {
      is_paid: payment.is_paid,
      amount: payment.amount,
    };
  });

  return paymentsByDate;
}

export async function fetchDailyPayments(dateStr: string): Promise<DailyPaymentStatus> {
  const { data, error } = await supabase
    .from('daily_salary_payments')
    .select('*')
    .eq('date', dateStr);

  if (error) {
    console.error("Failed to load daily payments", error);
    return {};
  }

  const payments: DailyPaymentStatus = {};
  (data || []).forEach((payment: any) => {
    payments[payment.employee_id] = {
      is_paid: payment.is_paid,
      amount: payment.amount,
    };
  });

  return payments;
}
