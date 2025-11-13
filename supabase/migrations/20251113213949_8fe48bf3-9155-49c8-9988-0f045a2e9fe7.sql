-- Fix RLS policies to allow inserting restaurants from search

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can view approved restaurants" ON public.restaurants;

-- Recreate with proper viewing permissions
CREATE POLICY "Public can view approved restaurants" 
ON public.restaurants 
FOR SELECT 
USING (
  status = 'approved' 
  OR auth.uid() = owner_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- Update the insert policy to set default status
DROP POLICY IF EXISTS "Anyone can insert restaurants" ON public.restaurants;
CREATE POLICY "Anyone can insert restaurants from search" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (
  status IS NULL 
  OR status = 'approved' 
  OR (auth.uid() IS NOT NULL AND status = 'pending')
);

-- Make sure existing restaurants without status get approved
UPDATE public.restaurants 
SET status = 'approved' 
WHERE status IS NULL;