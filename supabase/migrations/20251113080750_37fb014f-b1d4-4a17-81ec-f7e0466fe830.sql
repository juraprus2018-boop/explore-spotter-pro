-- Add city column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN city TEXT;

-- Create an index on city for better query performance
CREATE INDEX idx_restaurants_city ON public.restaurants(city);

-- Update existing records to extract city from display_name
-- City is typically the second part after splitting by comma
UPDATE public.restaurants 
SET city = TRIM(SPLIT_PART(display_name, ',', 2))
WHERE city IS NULL;