-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create provinces table
CREATE TABLE IF NOT EXISTS public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country_id, name)
);

-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(province_id, name)
);

-- Add city_id to restaurants and remove old city text column
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS city;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provinces_country ON public.provinces(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_province ON public.cities(province_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city_id);
CREATE INDEX IF NOT EXISTS idx_provinces_slug ON public.provinces(slug);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(slug);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for countries
CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert countries" ON public.countries FOR INSERT WITH CHECK (true);

-- RLS Policies for provinces
CREATE POLICY "Anyone can view provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Anyone can insert provinces" ON public.provinces FOR INSERT WITH CHECK (true);

-- RLS Policies for cities
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cities" ON public.cities FOR INSERT WITH CHECK (true);