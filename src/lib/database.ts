import { supabase } from "@/integrations/supabase/client";
import { NominatimResult } from "./nominatim";

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
  search_count: number;
  created_at: string;
  updated_at: string;
}

export const saveRestaurants = async (restaurants: NominatimResult[]) => {
  try {
    const restaurantsToSave = restaurants.map(r => ({
      place_id: r.place_id,
      name: r.name || r.display_name.split(',')[0],
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      type: r.type,
      osm_type: r.osm_type,
      osm_id: r.osm_id,
      address_type: r.addresstype,
    }));

    const { data, error } = await supabase
      .from('restaurants')
      .upsert(restaurantsToSave, {
        onConflict: 'place_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error saving restaurants:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in saveRestaurants:", error);
    return null;
  }
};

export const getRestaurantByPlaceId = async (placeId: number): Promise<DatabaseRestaurant | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
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
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
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
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
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

export const getNearbyRestaurants = async (lat: number, lon: number, radiusKm: number = 10): Promise<DatabaseRestaurant[]> => {
  try {
    // Simple distance calculation using lat/lon differences
    // 1 degree ≈ 111 km
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .gte('lat', lat - latDiff)
      .lte('lat', lat + latDiff)
      .gte('lon', lon - lonDiff)
      .lte('lon', lon + lonDiff)
      .limit(50);

    if (error) {
      console.error("Error fetching nearby restaurants:", error);
      return [];
    }

    // Calculate actual distance and sort
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
