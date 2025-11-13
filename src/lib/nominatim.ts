import axios from "axios";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export interface NominatimAddress {
  amenity?: string;
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
  address?: NominatimAddress;
  city?: string | null;
}

export const searchLocation = async (query: string): Promise<NominatimResult[]> => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 10,
      },
      headers: {
        "User-Agent": "TravelExplorer/1.0",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error searching location:", error);
    throw error;
  }
};

export const searchRestaurants = async (query: string): Promise<NominatimResult[]> => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: `restaurant ${query}`,
        format: "json",
        addressdetails: 1,
        limit: 20,
      },
      headers: {
        "User-Agent": "TravelExplorer/1.0",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error searching restaurants:", error);
    throw error;
  }
};

export const searchNearbyRestaurants = async (lat: number, lon: number, radiusKm: number = 25): Promise<NominatimResult[]> => {
  try {
    // Nominatim doesn't have a direct radius search, so we search in a bounding box
    // 1 degree ≈ 111 km
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: "restaurant",
        format: "json",
        addressdetails: 1,
        limit: 100,
        viewbox: `${lon - lonDiff},${lat + latDiff},${lon + lonDiff},${lat - latDiff}`,
        bounded: 1,
      },
      headers: {
        "User-Agent": "TravelExplorer/1.0",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error searching nearby restaurants:", error);
    throw error;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<NominatimResult> => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat,
        lon,
        format: "json",
      },
      headers: {
        "User-Agent": "TravelExplorer/1.0",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    throw error;
  }
};

// Search for locations only (cities, towns, countries) - for autocomplete
export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 10,
        // Only search for administrative places (cities, towns, countries, etc.)
        featuretype: "settlement",
      },
      headers: {
        "User-Agent": "RestaurantFinder/1.0",
      },
    });

    // Filter to only include cities, towns, villages, countries, states
    const locationResults = response.data.filter((result: NominatimResult) => {
      const acceptedTypes = ['city', 'town', 'village', 'county', 'state', 'country', 'municipality'];
      return acceptedTypes.includes(result.type) || acceptedTypes.includes(result.class);
    });

    return locationResults;
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
};
