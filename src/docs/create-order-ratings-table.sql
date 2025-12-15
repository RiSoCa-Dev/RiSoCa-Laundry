-- Create order_ratings table for customer ratings
-- This table stores ratings submitted by customers for their orders

-- Drop table if it exists (in case it was created with wrong schema)
DROP TABLE IF EXISTS order_ratings CASCADE;

CREATE TABLE order_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  contact_number TEXT,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_created_at ON order_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_ratings_overall_rating ON order_ratings(overall_rating);

-- Enable Row Level Security
ALTER TABLE order_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings (for display purposes)
CREATE POLICY "Anyone can view ratings"
  ON order_ratings FOR SELECT
  USING (true);

-- Policy: Anyone can submit ratings (for guest users)
CREATE POLICY "Anyone can submit ratings"
  ON order_ratings FOR INSERT
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE order_ratings IS 'Stores customer ratings for orders. One rating per order.';
