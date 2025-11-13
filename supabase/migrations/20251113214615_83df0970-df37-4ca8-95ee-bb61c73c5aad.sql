-- Fix RLS policy for restaurants INSERT to allow upserts from search

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert restaurants from search" ON public.restaurants;

-- Create a new INSERT policy that allows anyone to insert restaurants with status='approved' or NULL
CREATE POLICY "Anyone can insert restaurants from search"
ON public.restaurants
FOR INSERT
TO public
WITH CHECK (
  status IS NULL OR 
  status = 'approved' OR 
  (auth.uid() IS NOT NULL AND status = 'pending')
);

-- Ensure UPDATE policy exists for upserts
DROP POLICY IF EXISTS "Anyone can update restaurants" ON public.restaurants;
CREATE POLICY "Anyone can update restaurants"
ON public.restaurants
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);