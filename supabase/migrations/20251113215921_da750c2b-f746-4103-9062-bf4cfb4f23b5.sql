-- Make restaurants UPDATE policies permissive and allow public upsert for unowned approved records

-- 1) Recreate UPDATE policies as PERMISSIVE (correct syntax)
DROP POLICY IF EXISTS "Users can update their own restaurants" ON public.restaurants;
CREATE POLICY "Users can update their own restaurants"
ON public.restaurants
AS PERMISSIVE
FOR UPDATE
TO public
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can claim unowned restaurants" ON public.restaurants;
CREATE POLICY "Users can claim unowned restaurants"
ON public.restaurants
AS PERMISSIVE
FOR UPDATE
TO public
USING (owner_id IS NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can verify restaurants" ON public.restaurants;
CREATE POLICY "Admins can verify restaurants"
ON public.restaurants
AS PERMISSIVE
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Replace overly-broad update policy with a safer one for public upserts
DROP POLICY IF EXISTS "Anyone can update restaurants" ON public.restaurants;
CREATE POLICY "Public can upsert unowned approved restaurants"
ON public.restaurants
AS PERMISSIVE
FOR UPDATE
TO public
USING ((owner_id IS NULL) AND (status = 'approved'))
WITH CHECK ((owner_id IS NULL) AND (status = 'approved'));

-- Ensure INSERT policy is permissive as well (recreate to be explicit)
DROP POLICY IF EXISTS "Anyone can insert restaurants from search" ON public.restaurants;
CREATE POLICY "Anyone can insert restaurants from search"
ON public.restaurants
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  status IS NULL OR 
  status = 'approved' OR 
  (auth.uid() IS NOT NULL AND status = 'pending')
);