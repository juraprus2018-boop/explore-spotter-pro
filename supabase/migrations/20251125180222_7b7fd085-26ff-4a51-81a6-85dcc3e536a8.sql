-- Add price_range to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS price_range integer CHECK (price_range >= 1 AND price_range <= 4);

COMMENT ON COLUMN public.restaurants.price_range IS 'Price indicator: 1=€, 2=€€, 3=€€€, 4=€€€€';

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON public.favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON public.restaurants(price_range);