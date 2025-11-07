import axios from "axios";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

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
        amenity: "restaurant",
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
