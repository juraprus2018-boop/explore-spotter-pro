-- Ensure public insert/select for geographic hierarchy tables
-- Countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert countries" ON public.countries;
DROP POLICY IF EXISTS "Anyone can view countries" ON public.countries;
DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
DROP POLICY IF EXISTS "Public can insert countries" ON public.countries;
CREATE POLICY "Public can view countries"
ON public.countries
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert countries"
ON public.countries
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Provinces
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert provinces" ON public.provinces;
DROP POLICY IF EXISTS "Anyone can view provinces" ON public.provinces;
DROP POLICY IF EXISTS "Public can view provinces" ON public.provinces;
DROP POLICY IF EXISTS "Public can insert provinces" ON public.provinces;
CREATE POLICY "Public can view provinces"
ON public.provinces
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert provinces"
ON public.provinces
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert cities" ON public.cities;
DROP POLICY IF EXISTS "Anyone can view cities" ON public.cities;
DROP POLICY IF EXISTS "Public can view cities" ON public.cities;
DROP POLICY IF EXISTS "Public can insert cities" ON public.cities;
CREATE POLICY "Public can view cities"
ON public.cities
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert cities"
ON public.cities
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Optional grants (safe with RLS)
GRANT SELECT, INSERT ON public.countries TO anon, authenticated;
GRANT SELECT, INSERT ON public.provinces TO anon, authenticated;
GRANT SELECT, INSERT ON public.cities TO anon, authenticated;