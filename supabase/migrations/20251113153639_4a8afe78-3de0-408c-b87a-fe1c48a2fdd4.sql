-- Add photos column to restaurants table if it doesn't exist
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.restaurants.photos IS 'Array of photo URLs for the restaurant';