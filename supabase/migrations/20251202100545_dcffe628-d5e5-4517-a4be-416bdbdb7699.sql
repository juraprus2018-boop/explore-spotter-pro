-- Add more detailed restaurant information columns
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS start_date TEXT,
ADD COLUMN IF NOT EXISTS air_conditioning TEXT,
ADD COLUMN IF NOT EXISTS internet_access TEXT,
ADD COLUMN IF NOT EXISTS smoking TEXT,
ADD COLUMN IF NOT EXISTS reservation TEXT,
ADD COLUMN IF NOT EXISTS stars TEXT,
ADD COLUMN IF NOT EXISTS parking TEXT,
ADD COLUMN IF NOT EXISTS outdoor_seating_details TEXT,
ADD COLUMN IF NOT EXISTS accepts_reservations TEXT,
ADD COLUMN IF NOT EXISTS cuisine_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS accessibility_details JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.restaurants.capacity IS 'Number of seats/capacity';
COMMENT ON COLUMN public.restaurants.start_date IS 'Year restaurant opened';
COMMENT ON COLUMN public.restaurants.air_conditioning IS 'Air conditioning availability (yes/no)';
COMMENT ON COLUMN public.restaurants.internet_access IS 'Internet/WiFi availability and type';
COMMENT ON COLUMN public.restaurants.smoking IS 'Smoking policy (yes/no/outside/separated)';
COMMENT ON COLUMN public.restaurants.reservation IS 'Reservation policy';
COMMENT ON COLUMN public.restaurants.stars IS 'Star rating or classification';
COMMENT ON COLUMN public.restaurants.parking IS 'Parking availability and details';
COMMENT ON COLUMN public.restaurants.outdoor_seating_details IS 'Outdoor seating details';
COMMENT ON COLUMN public.restaurants.accepts_reservations IS 'Whether reservations are accepted';
COMMENT ON COLUMN public.restaurants.cuisine_details IS 'Detailed cuisine information';
COMMENT ON COLUMN public.restaurants.accessibility_details IS 'Detailed accessibility information';