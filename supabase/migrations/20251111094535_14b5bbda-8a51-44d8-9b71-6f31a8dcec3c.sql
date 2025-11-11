-- Create restaurants table to store all searched restaurants
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  type TEXT,
  osm_type TEXT,
  osm_id BIGINT,
  address_type TEXT,
  search_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read restaurants (public data)
CREATE POLICY "Anyone can view restaurants"
ON public.restaurants
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert restaurants
CREATE POLICY "Authenticated users can insert restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update restaurants
CREATE POLICY "Authenticated users can update restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (true);

-- Create index for faster lookups by place_id
CREATE INDEX idx_restaurants_place_id ON public.restaurants(place_id);

-- Create index for geolocation queries
CREATE INDEX idx_restaurants_location ON public.restaurants(lat, lon);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_restaurants_updated_at();