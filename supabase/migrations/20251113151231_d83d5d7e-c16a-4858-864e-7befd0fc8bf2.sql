-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add moderation fields to reviews
ALTER TABLE public.reviews
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN moderation_note TEXT;

-- Add claim verification fields to restaurants
ALTER TABLE public.restaurants
ADD COLUMN claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'approved', 'rejected')),
ADD COLUMN verification_documents TEXT[],
ADD COLUMN verification_note TEXT,
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient moderation queries
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_restaurants_claim_status ON public.restaurants(claim_status);

-- Update RLS policies for reviews to include moderation
CREATE POLICY "Admins and moderators can view all reviews"
ON public.reviews
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins and moderators can update reviews"
ON public.reviews
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Update RLS policies for restaurants to include verification
CREATE POLICY "Admins can verify restaurants"
ON public.restaurants
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));