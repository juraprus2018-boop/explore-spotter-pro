-- Allow upsert (UPDATE) on location tables used by nearby search

-- Countries: enable UPDATE for public
DROP POLICY IF EXISTS "Public can update countries" ON public.countries;
CREATE POLICY "Public can update countries"
ON public.countries
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Provinces: enable UPDATE for public
DROP POLICY IF EXISTS "Public can update provinces" ON public.provinces;
CREATE POLICY "Public can update provinces"
ON public.provinces
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Cities: enable UPDATE for public
DROP POLICY IF EXISTS "Public can update cities" ON public.cities;
CREATE POLICY "Public can update cities"
ON public.cities
FOR UPDATE
USING (true)
WITH CHECK (true);
