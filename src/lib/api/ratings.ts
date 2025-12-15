import { supabase } from '../supabase-client';

export type OrderRatingInsert = {
  order_id: string;
  customer_name: string;
  contact_number?: string | null;
  overall_rating: number;
  feedback_message?: string | null;
};

export type OrderRating = {
  id: string;
  order_id: string;
  customer_name: string;
  contact_number?: string | null;
  overall_rating: number;
  feedback_message?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Submits a rating for an order
 */
export async function submitOrderRating(rating: OrderRatingInsert) {
  // Check if rating already exists for this order
  const { data: existing } = await supabase
    .from('order_ratings')
    .select('id')
    .eq('order_id', rating.order_id)
    .maybeSingle();
  
  if (existing) {
    return {
      error: {
        message: 'Rating already submitted for this order'
      }
    };
  }
  
  // Insert rating
  return await supabase
    .from('order_ratings')
    .insert(rating)
    .select()
    .single();
}

/**
 * Gets the rating for a specific order
 */
export async function getOrderRating(orderId: string) {
  return await supabase
    .from('order_ratings')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
}

/**
 * Gets average rating across all orders
 */
export async function getAverageRating() {
  const { data, error } = await supabase
    .from('order_ratings')
    .select('overall_rating');
  
  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const sum = data.reduce((acc, r) => acc + r.overall_rating, 0);
  return {
    average: sum / data.length,
    count: data.length,
  };
}
