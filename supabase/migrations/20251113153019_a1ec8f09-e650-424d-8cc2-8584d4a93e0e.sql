-- Create table for restaurant change suggestions
CREATE TABLE IF NOT EXISTS public.restaurant_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('address', 'phone', 'website', 'hours', 'photos', 'other')),
  current_value TEXT,
  suggested_value TEXT,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.restaurant_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved suggestions
CREATE POLICY "Anyone can view approved suggestions"
ON public.restaurant_suggestions
FOR SELECT
USING (status = 'approved');

-- Anyone can create suggestions
CREATE POLICY "Anyone can create suggestions"
ON public.restaurant_suggestions
FOR INSERT
WITH CHECK (true);

-- Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.restaurant_suggestions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins and moderators can view all suggestions
CREATE POLICY "Admins and moderators can view all suggestions"
ON public.restaurant_suggestions
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Admins and moderators can update suggestions
CREATE POLICY "Admins and moderators can update suggestions"
ON public.restaurant_suggestions
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Create storage bucket for suggestion photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('suggestion-photos', 'suggestion-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for suggestion photos
CREATE POLICY "Anyone can upload suggestion photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'suggestion-photos');

CREATE POLICY "Suggestion photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'suggestion-photos');

-- Create trigger for updated_at
CREATE TRIGGER update_restaurant_suggestions_updated_at
  BEFORE UPDATE ON public.restaurant_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_restaurants_updated_at();