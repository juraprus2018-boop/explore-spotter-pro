-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
DROP FUNCTION IF EXISTS public.update_restaurants_updated_at();

CREATE OR REPLACE FUNCTION public.update_restaurants_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_restaurants_updated_at();