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
  cuisine?: string | null;
  amenity?: string | null;
  brand?: string | null;
  operator?: string | null;
  building?: string | null;
  wheelchair?: string | null;
  outdoor_seating?: string | null;
  takeaway?: string | null;
  delivery?: string | null;
  diet_options?: any | null;
  payment_options?: any | null;
  contact_info?: any | null;
  extratags?: any | null;
  price_range?: number | null;
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

      const extratags = r.extratags || {};
      
      // Extract diet options
      const dietOptions: any = {};
      if (extratags['diet:vegetarian']) dietOptions.vegetarian = extratags['diet:vegetarian'];
      if (extratags['diet:vegan']) dietOptions.vegan = extratags['diet:vegan'];
      if (extratags['diet:gluten_free']) dietOptions.gluten_free = extratags['diet:gluten_free'];
      if (extratags['diet:halal']) dietOptions.halal = extratags['diet:halal'];
      if (extratags['diet:kosher']) dietOptions.kosher = extratags['diet:kosher'];
      
      // Extract payment options
      const paymentOptions: any = {};
      if (extratags['payment:cash']) paymentOptions.cash = extratags['payment:cash'];
      if (extratags['payment:credit_cards']) paymentOptions.credit_cards = extratags['payment:credit_cards'];
      if (extratags['payment:debit_cards']) paymentOptions.debit_cards = extratags['payment:debit_cards'];
      
      // Extract contact info
      const contactInfo: any = {};
      if (extratags.phone) contactInfo.phone = extratags.phone;
      if (extratags.website) contactInfo.website = extratags.website;
      if (extratags.email) contactInfo.email = extratags.email;

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
        cuisine: extratags.cuisine || null,
        amenity: extratags.amenity || null,
        brand: extratags.brand || null,
        operator: extratags.operator || null,
        building: extratags.building || null,
        wheelchair: extratags.wheelchair || null,
        outdoor_seating: extratags.outdoor_seating || null,
        takeaway: extratags.takeaway || null,
        delivery: extratags.delivery || null,
        diet_options: Object.keys(dietOptions).length > 0 ? dietOptions : null,
        payment_options: Object.keys(paymentOptions).length > 0 ? paymentOptions : null,
        contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null,
        phone: extratags.phone || null,
        website: extratags.website || null,
        opening_hours: extratags.opening_hours || null,
        extratags: extratags,
        status: 'approved', // OpenStreetMap restaurants are automatically approved
      });
    }

    if (restaurantsToSave.length === 0) return null;

    // First attempt direct upsert; if RLS blocks (401/42501), fallback to edge function with service role
    const { error } = await supabase
      .from('restaurants')
      .upsert(restaurantsToSave, {
        onConflict: 'place_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Error saving restaurants via REST:", error);
      try {
        const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-restaurants`;
        const resp = await fetch(functionsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurants: restaurantsToSave }),
        });
        if (!resp.ok) {
          console.error('Edge function ingest failed:', await resp.text());
          return null;
        }
      } catch (efErr) {
        console.error('Edge function call error:', efErr);
        return null;
      }
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

export const getNearbyRestaurants = async (lat: number, lon: number, radiusKm: number = 5): Promise<DatabaseRestaurant[]> => {
  try {
    // Optimized query with smaller bounding box for faster results
    const latRange = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lonRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

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
      .gte('lat', lat - latRange)
      .lte('lat', lat + latRange)
      .gte('lon', lon - lonRange)
      .lte('lon', lon + lonRange)
      .limit(50);

    if (error) {
      console.error("Error fetching nearby restaurants:", error);
      return [];
    }

    // Calculate actual distances and filter by radius
    const restaurantsWithDistance = (data || []).map(r => ({
      ...r,
      distance: Math.sqrt(
        Math.pow((r.lat - lat) * 111, 2) + 
        Math.pow((r.lon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)
      )
    })).filter(r => r.distance <= radiusKm);

    return restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 30);
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

export const getCitiesByCountryCode = async (countryCode: string): Promise<City[]> => {
  const { data, error } = await (db as any)
    .from('cities')
    .select(`
      *,
      province:provinces(
        *,
        country:countries(*)
      )
    `)
    .eq('province.country.code', countryCode.toUpperCase())
    .order('name');

  if (error) {
    console.error('Error fetching cities by country code:', error);
    return [];
  }

  return data || [];
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

export const getSimilarRestaurants = async (
  restaurantId: string,
  lat: number,
  lon: number,
  cuisine: string | null,
  priceRange: number | null
): Promise<DatabaseRestaurant[]> => {
  try {
    const radiusKm = 10; // Increased radius to find more similar restaurants
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    let query = (db as any)
      .from("restaurants")
      .select(
        `
        *,
        city:cities (
          *,
          province:provinces (
            *,
            country:countries (*)
          )
        )
      `
      )
      .neq("id", restaurantId)
      .gte("lat", lat - latDelta)
      .lte("lat", lat + latDelta)
      .gte("lon", lon - lonDelta)
      .lte("lon", lon + lonDelta);

    if (cuisine) {
      query = query.ilike("cuisine", `%${cuisine}%`);
    }

    if (priceRange) {
      query = query.eq("price_range", priceRange);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error("Error fetching similar restaurants:", error);
      return [];
    }

    if (!data) return [];

    // Calculate distance for each restaurant
    const restaurantsWithDistance = data.map((restaurant: any) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((restaurant.lat - lat) * Math.PI) / 180;
      const dLon = ((restaurant.lon - lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((restaurant.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c * 1000; // Distance in meters

      return {
        ...restaurant,
        distance,
      };
    });

    // Remove duplicates based on place_id (keep the first occurrence)
    const uniqueRestaurants = restaurantsWithDistance.reduce((acc: any[], current: any) => {
      const duplicate = acc.find(item => item.place_id === current.place_id);
      if (!duplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Sort by distance (closest first) and limit to 6
    return uniqueRestaurants.sort((a, b) => a.distance - b.distance).slice(0, 6);
  } catch (error) {
    console.error("Error in getSimilarRestaurants:", error);
    return [];
  }
};

export const getTopRatedRestaurantsByCity = async (citySlug: string, limit: number = 6): Promise<DatabaseRestaurant[]> => {
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
        ),
        reviews:reviews(rating)
      `)
      .eq('city.slug', citySlug)
      .order('search_count', { ascending: false })
      .limit(limit * 3);

    if (error) {
      console.error("Error fetching top rated restaurants:", error);
      return [];
    }

    // Calculate average rating for each restaurant
    const restaurantsWithRatings = (data || []).map(restaurant => {
      const reviews = (restaurant as any).reviews || [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0;
      
      return {
        ...restaurant,
        avgRating,
        reviewCount: reviews.length
      };
    });

    // Sort by average rating and review count, filter out those with no reviews
    return restaurantsWithRatings
      .filter(r => r.reviewCount > 0)
      .sort((a, b) => {
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Error in getTopRatedRestaurantsByCity:", error);
    return [];
  }
};
