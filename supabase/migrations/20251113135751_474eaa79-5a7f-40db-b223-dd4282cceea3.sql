-- Fix RLS policies for countries, provinces, and cities tables
-- The current policies are RESTRICTIVE which is causing issues
-- We need to drop them and recreate as PERMISSIVE policies

-- Countries table
DROP POLICY IF EXISTS "Anyone can insert countries" ON public.countries;
DROP POLICY IF EXISTS "Anyone can view countries" ON public.countries;

CREATE POLICY "Anyone can insert countries"
ON public.countries
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view countries"
ON public.countries
FOR SELECT
TO public
USING (true);

-- Provinces table
DROP POLICY IF EXISTS "Anyone can insert provinces" ON public.provinces;
DROP POLICY IF EXISTS "Anyone can view provinces" ON public.provinces;

CREATE POLICY "Anyone can insert provinces"
ON public.provinces
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view provinces"
ON public.provinces
FOR SELECT
TO public
USING (true);

-- Cities table
DROP POLICY IF EXISTS "Anyone can insert cities" ON public.cities;
DROP POLICY IF EXISTS "Anyone can view cities" ON public.cities;

CREATE POLICY "Anyone can insert cities"
ON public.cities
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view cities"
ON public.cities
FOR SELECT
TO public
USING (true);