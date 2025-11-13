-- Add ip_address column to reviews table for rate limiting
ALTER TABLE public.reviews 
ADD COLUMN ip_address text;

-- Create index for efficient IP-based queries
CREATE INDEX idx_reviews_ip_created ON public.reviews(ip_address, created_at);