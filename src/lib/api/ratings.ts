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

export type RatingWithOrder = OrderRating & {
  order?: {
    loads: number;
    weight: number;
  };
  like_count?: number;
  user_has_liked?: boolean;
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

/**
 * Gets all ratings with order details and like counts
 */
export async function fetchAllRatings(userId?: string) {
  // Fetch ratings
  const { data: ratings, error: ratingsError } = await supabase
    .from('order_ratings')
    .select('*')
    .order('created_at', { ascending: false });

  if (ratingsError || !ratings) {
    return { data: null, error: ratingsError };
  }

  // Fetch order details for all ratings
  const orderIds = ratings.map(r => r.order_id);
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, loads, weight')
    .in('id', orderIds);

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  // Create a map of order_id -> order details
  const orderMap = new Map<string, { loads: number; weight: number }>();
  if (orders) {
    orders.forEach(order => {
      orderMap.set(order.id, {
        loads: order.loads || 0,
        weight: order.weight || 0,
      });
    });
  }

  // Fetch like counts for all ratings
  const ratingIds = ratings.map(r => r.id);
  const { data: likes, error: likesError } = await supabase
    .from('rating_likes')
    .select('rating_id, user_id')
    .in('rating_id', ratingIds);

  if (likesError) {
    console.error('Error fetching likes:', likesError);
  }

  // Count likes per rating and check if user has liked
  const likeCounts = new Map<string, number>();
  const userLikes = new Set<string>();

  if (likes) {
    likes.forEach(like => {
      const count = likeCounts.get(like.rating_id) || 0;
      likeCounts.set(like.rating_id, count + 1);
      
      if (userId && like.user_id === userId) {
        userLikes.add(like.rating_id);
      }
    });
  }

  // Combine data
  const ratingsWithDetails: RatingWithOrder[] = ratings.map(rating => ({
    ...rating,
    order: orderMap.get(rating.order_id) || { loads: 0, weight: 0 },
    like_count: likeCounts.get(rating.id) || 0,
    user_has_liked: userId ? userLikes.has(rating.id) : false,
  }));

  return { data: ratingsWithDetails, error: null };
}

/**
 * Gets a single rating with full order details
 */
export async function fetchRatingDetails(ratingId: string, userId?: string) {
  // Fetch rating
  const { data: rating, error: ratingError } = await supabase
    .from('order_ratings')
    .select('*')
    .eq('id', ratingId)
    .single();

  if (ratingError || !rating) {
    return { data: null, error: ratingError };
  }

  // Fetch order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('loads, weight')
    .eq('id', rating.order_id)
    .single();

  if (orderError) {
    console.error('Error fetching order:', orderError);
  }

  // Fetch like count and check if user has liked
  const { data: likes, error: likesError } = await supabase
    .from('rating_likes')
    .select('user_id')
    .eq('rating_id', ratingId);

  let likeCount = 0;
  let userHasLiked = false;

  if (likes && !likesError) {
    likeCount = likes.length;
    if (userId) {
      userHasLiked = likes.some(like => like.user_id === userId);
    }
  }

  const ratingWithDetails: RatingWithOrder = {
    ...rating,
    order: order ? {
      loads: order.loads || 0,
      weight: order.weight || 0,
    } : { loads: 0, weight: 0 },
    like_count: likeCount,
    user_has_liked: userHasLiked,
  };

  return { data: ratingWithDetails, error: null };
}

/**
 * Toggles like on a rating
 */
export async function toggleRatingLike(ratingId: string, userId: string) {
  // Check if user already liked
  const { data: existingLike, error: checkError } = await supabase
    .from('rating_likes')
    .select('id')
    .eq('rating_id', ratingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
    return { data: null, error: checkError };
  }

  if (existingLike) {
    // Unlike: delete the like
    const { error: deleteError } = await supabase
      .from('rating_likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    return { data: { liked: false }, error: null };
  } else {
    // Like: insert the like
    const { data, error: insertError } = await supabase
      .from('rating_likes')
      .insert({
        rating_id: ratingId,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      return { data: null, error: insertError };
    }

    return { data: { liked: true }, error: null };
  }
}
