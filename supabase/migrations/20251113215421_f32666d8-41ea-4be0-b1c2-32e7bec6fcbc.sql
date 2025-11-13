-- Ensure anon and authenticated roles have required privileges on restaurants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.restaurants TO anon, authenticated;