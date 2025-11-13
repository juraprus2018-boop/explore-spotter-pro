-- Ensure unique index for upsert on restaurants.place_id
CREATE UNIQUE INDEX IF NOT EXISTS restaurants_place_id_uniq ON public.restaurants (place_id);

-- Helpful index for city-based queries
CREATE INDEX IF NOT EXISTS restaurants_city_id_idx ON public.restaurants (city_id);
