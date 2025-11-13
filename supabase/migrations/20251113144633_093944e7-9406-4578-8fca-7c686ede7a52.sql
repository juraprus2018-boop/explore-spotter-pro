-- Add ownership and claim fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS user_submitted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS opening_hours jsonb;

-- Create index for owner queries
CREATE INDEX IF NOT EXISTS restaurants_owner_id_idx ON public.restaurants (owner_id);

-- Update RLS policies to allow users to update their own restaurants
CREATE POLICY "Users can update their own restaurants"
ON public.restaurants
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy to allow users to claim unowned restaurants
CREATE POLICY "Users can claim unowned restaurants"
ON public.restaurants
FOR UPDATE
USING (owner_id IS NULL)
WITH CHECK (auth.uid() IS NOT NULL);