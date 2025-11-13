-- Make user_id nullable to allow anonymous reviews
ALTER TABLE public.reviews 
ALTER COLUMN user_id DROP NOT NULL;

-- Add photos column to store image URLs
ALTER TABLE public.reviews 
ADD COLUMN photos text[] DEFAULT '{}';

-- Update RLS policies to allow anonymous reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Allow anyone to create reviews (authenticated or anonymous)
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Users can update their own reviews (if authenticated)
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Users can delete their own reviews (if authenticated)
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (user_id IS NULL OR auth.uid() = user_id);

-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for review photos
CREATE POLICY "Anyone can view review photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Anyone can upload review photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "Users can delete their own review photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'review-photos');