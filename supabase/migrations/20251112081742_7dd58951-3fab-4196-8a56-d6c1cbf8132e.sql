-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON public.restaurants;

-- Create a new policy that allows anyone to insert restaurants
CREATE POLICY "Anyone can insert restaurants"
ON public.restaurants
FOR INSERT
TO public
WITH CHECK (true);

-- Also update the UPDATE policy to allow anonymous users
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON public.restaurants;

CREATE POLICY "Anyone can update restaurants"
ON public.restaurants
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);