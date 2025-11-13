-- Add email and status fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS owner_email text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);

-- Update RLS policy to show only approved restaurants to public
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view approved restaurants" 
ON public.restaurants 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Allow users to view their own pending restaurants
CREATE POLICY "Users can view their own pending restaurants" 
ON public.restaurants 
FOR SELECT 
USING (auth.uid() = owner_id);