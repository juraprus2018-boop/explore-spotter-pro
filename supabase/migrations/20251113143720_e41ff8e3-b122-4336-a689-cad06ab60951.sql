-- Add unique constraints to support upserts
CREATE UNIQUE INDEX IF NOT EXISTS countries_code_uniq ON public.countries (code);
CREATE UNIQUE INDEX IF NOT EXISTS provinces_country_name_uniq ON public.provinces (country_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS cities_province_name_uniq ON public.cities (province_id, name);
