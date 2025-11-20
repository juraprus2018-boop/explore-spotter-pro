-- Create foodwall_posts table
CREATE TABLE public.foodwall_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  author TEXT NOT NULL,
  location TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.foodwall_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view and create posts)
CREATE POLICY "Anyone can view foodwall posts" 
ON public.foodwall_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create foodwall posts" 
ON public.foodwall_posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update likes on foodwall posts" 
ON public.foodwall_posts 
FOR UPDATE 
USING (true);

-- Create storage bucket for foodwall uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('foodwall-uploads', 'foodwall-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for foodwall uploads
CREATE POLICY "Anyone can view foodwall images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'foodwall-uploads');

CREATE POLICY "Anyone can upload foodwall images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'foodwall-uploads');