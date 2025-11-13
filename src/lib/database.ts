import { supabase } from "@/integrations/supabase/client";
import { NominatimResult } from "./nominatim";
const db = supabase as any;

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Province {
  id: string;
  name: string;
  slug: string;
  country_id: string;
  created_at: string;
  country?: Country;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  province_id: string;
  created_at: string;
  province?: Province;
}

export interface DatabaseRestaurant {
  id: string;
  place_id: number;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string | null;
  osm_type: string | null;
  osm_id: number | null;
  address_type: string | null;
  city_id: string | null;
  search_count: number;
  created_at: string;
  updated_at: string;
  owner_id?: string | null;
  claimed_at?: string | null;
  claim_status?: string;
  verification_documents?: string[] | null;
  verification_note?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  user_submitted?: boolean;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  opening_hours?: any | null;
  photos?: string[] | null;
  city?: City;
}

// Helper function to create slug
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Extract location data from Nominatim address
const extractLocationData = (result: NominatimResult) => {
  const address: any = result.address || {};
  
  // Province/region detection for international coverage
  const provinceName =
    address.state ||
    address.county ||
    address.region ||
    address.state_district ||
    address.province ||
    null;
  
  // City detection (settlement-level)
  const cityName =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.hamlet ||
    address.suburb ||
    null;
  
  // Country
  const countryName = address.country || "Unknown";
  const countryCode = (address.country_code || "xx").toLowerCase();
  
  return { cityName, provinceName, countryName, countryCode };
};

// Get or create country
export const getOrCreateCountry = async (name: string, code: string): Promise<string | null> => {
  try {
    // Use upsert to handle duplicates gracefully
    const { error } = await db
      .from('countries')
      .upsert(
        { name, code }, 
        { onConflict: 'code', ignoreDuplicates: false }
      );

    if (error) {
      console.error("Error upserting country:", error);
      // If upsert fails, try to find existing by code
      const { data: existing } = await db
        .from('countries')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      
      return existing?.id || null;
    }

    // Fetch id after successful upsert without return=representation
    const { data: existingAfter } = await db
      .from('countries')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    return existingAfter?.id || null;
  } catch (error) {
    console.error("Error in getOrCreateCountry:", error);
    // Try to find existing as fallback
    try {
      const { data: existing } = await db
        .from('countries')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      
      return existing?.id || null;
    } catch {
      return null;
    }
  }
};

// Get or create province
export const getOrCreateProvince = async (name: string, countryId: string): Promise<string | null> => {
  try {
    const slug = createSlug(name);
    
    // Use upsert to handle duplicates
    const { error } = await db
      .from('provinces')
      .upsert(
        { name, slug, country_id: countryId },
        { onConflict: 'name,country_id', ignoreDuplicates: false }
      );

    if (error) {
      console.error("Error upserting province:", error);
      // Fallback: try to find existing
      const { data: existing } = await db
        .from('provinces')
        .select('id')
        .eq('name', name)
        .eq('country_id', countryId)
        .maybeSingle();
      
      return existing?.id || null;
    }

    // Fetch id after successful upsert
    const { data: existingAfter } = await db
      .from('provinces')
      .select('id')
      .eq('name', name)
      .eq('country_id', countryId)
      .maybeSingle();

    return existingAfter?.id || null;
  } catch (error) {
    console.error("Error in getOrCreateProvince:", error);
    try {
      const { data: existing } = await db
        .from('provinces')
        .select('id')
        .eq('name', name)
        .eq('country_id', countryId)
        .maybeSingle();
      
      return existing?.id || null;
    } catch {
      return null;
    }
  }
};

// Get or create city
export const getOrCreateCity = async (name: string, provinceId: string): Promise<string | null> => {
  try {
    const slug = createSlug(name);
    
    // Use upsert to handle duplicates
    const { error } = await db
      .from('cities')
      .upsert(
        { name, slug, province_id: provinceId },
        { onConflict: 'name,province_id', ignoreDuplicates: false }
      );

    if (error) {
      console.error("Error upserting city:", error);
      // Fallback: try to find existing
      const { data: existing } = await db
        .from('cities')
        .select('id')
        .eq('name', name)
        .eq('province_id', provinceId)
        .maybeSingle();
      
      return existing?.id || null;
    }

    // Fetch id after successful upsert
    const { data: existingAfter } = await db
      .from('cities')
      .select('id')
      .eq('name', name)
      .eq('province_id', provinceId)
      .maybeSingle();

    return existingAfter?.id || null;
  } catch (error) {
    console.error("Error in getOrCreateCity:", error);
    try {
      const { data: existing } = await db
        .from('cities')
        .select('id')
        .eq('name', name)
        .eq('province_id', provinceId)
        .maybeSingle();
      
      return existing?.id || null;
    } catch {
      return null;
    }
  }
};

export const saveRestaurants = async (restaurants: NominatimResult[]) => {
  try {
    const restaurantsToSave = [] as any[];
    
    // Simple in-memory caches to cut roundtrips dramatically
    const countryCache = new Map<string, string>(); // key: countryCode -> id
    const provinceCache = new Map<string, string>(); // key: `${countryId}:${provinceName}` -> id
    const cityCache = new Map<string, string>(); // key: `${provinceId}:${cityName}` -> id
    
    for (const r of restaurants) {
      const { cityName, provinceName, countryName, countryCode } = extractLocationData(r);
      
      if (!cityName || !provinceName) continue;

      // Country
      let countryId = countryCache.get(countryCode);
      if (!countryId) {
        countryId = await getOrCreateCountry(countryName, countryCode);
        if (!countryId) continue;
        countryCache.set(countryCode, countryId);
      }

      // Province
      const provKey = `${countryId}:${provinceName.toLowerCase()}`;
      let provinceId = provinceCache.get(provKey);
      if (!provinceId) {
        provinceId = await getOrCreateProvince(provinceName, countryId);
        if (!provinceId) continue;
        provinceCache.set(provKey, provinceId);
      }

      // City
      const cityKey = `${provinceId}:${cityName.toLowerCase()}`;
      let cityId = cityCache.get(cityKey);
      if (!cityId) {
        cityId = await getOrCreateCity(cityName, provinceId);
        if (!cityId) continue;
        cityCache.set(cityKey, cityId);
      }

      restaurantsToSave.push({
        place_id: r.place_id,
        name: r.name || r.display_name.split(',')[0],
        display_name: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        type: r.type,
        osm_type: r.osm_type,
        osm_id: r.osm_id,
        address_type: r.addresstype,
        city_id: cityId,
      });
    }

    if (restaurantsToSave.length === 0) return null;

    const { error } = await supabase
      .from('restaurants')
      .upsert(restaurantsToSave, {
        onConflict: 'place_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Error saving restaurants:", error);
      return null;
    }

    // Return the saved restaurants with their IDs
    const { data: savedRestaurants } = await supabase
      .from('restaurants')
      .select('*')
      .in('place_id', restaurantsToSave.map(r => r.place_id));

    return savedRestaurants || restaurantsToSave;
  } catch (error) {
    console.error("Error in saveRestaurants:", error);
    return null;
  }
};

export const getRestaurantByPlaceId = async (placeId: number): Promise<DatabaseRestaurant | null> => {
  try {
    const { data, error } = await db
      .from('restaurants')
      .select(`
        *,
        city:cities (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `)
      .eq('place_id', placeId)
      .single();

    if (error) {
      console.error("Error fetching restaurant:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getRestaurantByPlaceId:", error);
    return null;
  }
};

export const getAllRestaurants = async (): Promise<DatabaseRestaurant[]> => {
  try {
    const { data, error } = await db
      .from('restaurants')
      .select(`
        *,
        city:cities (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `)
      .order('search_count', { ascending: false });

    if (error) {
      console.error("Error fetching all restaurants:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllRestaurants:", error);
    return [];
  }
};

export const searchRestaurantsInDatabase = async (query: string): Promise<DatabaseRestaurant[]> => {
  try {
    const { data, error } = await db
      .from('restaurants')
      .select(`
        *,
        city:cities (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `)
      .or(`name.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('search_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error searching restaurants in database:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchRestaurantsInDatabase:", error);
    return [];
  }
};

export const getNearbyRestaurants = async (lat: number, lon: number, radiusKm: number = 25): Promise<DatabaseRestaurant[]> => {
  try {
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await db
      .from('restaurants')
      .select(`
        *,
        city:cities (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `)
      .gte('lat', lat - latDiff)
      .lte('lat', lat + latDiff)
      .gte('lon', lon - lonDiff)
      .lte('lon', lon + lonDiff)
      .limit(50);

    if (error) {
      console.error("Error fetching nearby restaurants:", error);
      return [];
    }

    const restaurantsWithDistance = (data || []).map(r => ({
      ...r,
      distance: Math.sqrt(
        Math.pow((r.lat - lat) * 111, 2) + 
        Math.pow((r.lon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)
      )
    })).filter(r => r.distance <= radiusKm);

    return restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
  } catch (error) {
    console.error("Error in getNearbyRestaurants:", error);
    return [];
  }
};

export const getRestaurantsByCity = async (citySlug: string): Promise<DatabaseRestaurant[]> => {
  try {
    const { data, error } = await db
      .from('restaurants')
      .select(`
        *,
        city:cities!inner (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `)
      .eq('city.slug', citySlug)
      .order('search_count', { ascending: false });

    if (error) {
      console.error("Error fetching restaurants by city:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getRestaurantsByCity:", error);
    return [];
  }
};

export const getCitiesByProvince = async (provinceSlug: string): Promise<City[]> => {
  try {
    const { data, error } = await db
      .from('cities')
      .select(`
        *,
        province:provinces!inner (
          *,
          country:countries (*)
        )
      `)
      .eq('province.slug', provinceSlug)
      .order('name');

    if (error) {
      console.error("Error fetching cities by province:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCitiesByProvince:", error);
    return [];
  }
};

export const getAllProvinces = async (): Promise<Province[]> => {
  try {
    const { data, error } = await db
      .from('provinces')
      .select(`
        *,
        country:countries (*)
      `)
      .order('name');

    if (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllProvinces:", error);
    return [];
  }
};

export const getProvinceBySlug = async (slug: string): Promise<Province | null> => {
  try {
    const { data, error } = await db
      .from('provinces')
      .select(`
        *,
        country:countries (*)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching province:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getProvinceBySlug:", error);
    return null;
  }
};

export const getCityBySlug = async (slug: string): Promise<City | null> => {
  try {
    const { data, error } = await db
      .from('cities')
      .select(`
        *,
        province:provinces (
          *,
          country:countries (*)
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching city:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCityBySlug:", error);
    return null;
  }
};
