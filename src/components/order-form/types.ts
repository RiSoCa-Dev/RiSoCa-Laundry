import { z } from 'zod';

export const orderSchema = z.object({
  servicePackage: z.string().min(1, "Please select a package."),
  weight: z.coerce.number().min(0, "Weight cannot be negative.").max(75, "Maximum of 10 loads (75kg) per order.").optional(),
  distance: z.coerce.number().min(0, "Distance cannot be negative.").max(50, "We don't deliver beyond 50 km."),
});

export const customerInfoSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  contactNumber: z.string().min(10, "A valid contact number is required."),
  deliveryOption: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type CustomerFormValues = z.infer<typeof customerInfoSchema>;

export interface PendingOrder {
  orderData: OrderFormValues;
  pricing: { computedPrice: number };
  loads: number;
}

export const packages = [
  { id: 'package1', label: 'Package 1', description: 'Wash, Dry, & Fold' },
  { id: 'package2', label: 'Package 2', description: 'One-Way Transport' },
  { id: 'package3', label: 'Package 3', description: 'All-In (Pick Up & Delivery)' },
] as const;
