-- Create rating_likes table for tracking likes on customer ratings
CREATE TABLE IF NOT EXISTS rating_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES order_ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rating_likes_rating_id ON rating_likes(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_likes_user_id ON rating_likes(user_id);

-- Enable RLS
ALTER TABLE rating_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read likes (public)
CREATE POLICY "Anyone can read rating likes"
  ON rating_likes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert likes
CREATE POLICY "Authenticated users can like ratings"
  ON rating_likes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON rating_likes
  FOR DELETE
  USING (auth.uid() = user_id);

