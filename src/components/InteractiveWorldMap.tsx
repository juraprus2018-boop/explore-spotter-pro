import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reverseGeocode, searchNearbyRestaurants } from "@/lib/nominatim";
import { saveRestaurants } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Leaflet loaded via CDN in index.html
declare const L: any;


// Country coordinates based on language
const COUNTRY_COORDS: Record<string, { lat: number; lon: number; zoom: number }> = {
  nl: { lat: 52.1326, lon: 5.2913, zoom: 7 },      // Netherlands
  en: { lat: 54.7023, lon: -3.2765, zoom: 5 },     // United Kingdom
  de: { lat: 51.1657, lon: 10.4515, zoom: 6 },     // Germany
  fr: { lat: 46.2276, lon: 2.2137, zoom: 6 },      // France
  es: { lat: 40.4637, lon: -3.7492, zoom: 6 },     // Spain
  it: { lat: 41.8719, lon: 12.5674, zoom: 6 },     // Italy
  pt: { lat: 39.3999, lon: -8.2245, zoom: 7 },     // Portugal
  pl: { lat: 51.9194, lon: 19.1451, zoom: 6 },     // Poland
  hr: { lat: 45.1, lon: 15.2, zoom: 7 },           // Croatia
  ru: { lat: 61.5240, lon: 105.3188, zoom: 3 },    // Russia
  ja: { lat: 36.2048, lon: 138.2529, zoom: 5 },    // Japan
  zh: { lat: 35.8617, lon: 104.1954, zoom: 4 },    // China
  ar: { lat: 23.8859, lon: 45.0792, zoom: 5 },     // Saudi Arabia
  tr: { lat: 38.9637, lon: 35.2433, zoom: 6 },     // Turkey
  sv: { lat: 60.1282, lon: 18.6435, zoom: 5 },     // Sweden
  da: { lat: 56.2639, lon: 9.5018, zoom: 7 },      // Denmark
  no: { lat: 60.4720, lon: 8.4689, zoom: 5 },      // Norway
  fi: { lat: 61.9241, lon: 25.7482, zoom: 5 },     // Finland
  cs: { lat: 49.8175, lon: 15.4730, zoom: 7 },     // Czech Republic
  ro: { lat: 45.9432, lon: 24.9668, zoom: 7 },     // Romania
};

const InteractiveWorldMap = () => {
  const navigate = useNavigate();
  const { lang = "nl" } = useParams();
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create custom marker icon (same as MapView)
  const createCustomIcon = (isHighlighted: boolean = false) => {
    if (typeof L === 'undefined') return null;
    return new L.DivIcon({
      className: 'custom-marker-icon',
      html: `
        <div class="relative ${isHighlighted ? 'highlighted-marker' : ''}">
          <div class="w-10 h-10 ${isHighlighted ? 'bg-accent' : 'bg-primary'} rounded-full shadow-lg border-4 border-white flex items-center justify-center transform transition-all duration-200 hover:scale-110 ${isHighlighted ? 'scale-125 animate-pulse' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isHighlighted ? 'border-t-accent' : 'border-t-primary'}"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  };

  const loadRestaurantMarkers = useCallback(async () => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const bounds = mapRef.current.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    try {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          place_id,
          lat,
          lon,
          display_name,
          city:cities(slug, province:provinces(slug))
        `)
        .gte('lat', south)
        .lte('lat', north)
        .gte('lon', west)
        .lte('lon', east)
        .eq('status', 'approved')
        .limit(100);

      if (!restaurants) return;

      // Clear existing markers
      markersLayerRef.current.clearLayers();

      // Add markers for each restaurant
      restaurants.forEach((restaurant) => {
        if (!markersLayerRef.current) return;

        const customIcon = createCustomIcon(false);
        if (!customIcon) return;

        const marker = L.marker([Number(restaurant.lat), Number(restaurant.lon)], {
          icon: customIcon,
        });

        const cityData = restaurant.city as any;
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">${restaurant.name}</h3>
            <p style="font-size: 0.875rem; color: #666; margin-bottom: 8px;">${restaurant.display_name}</p>
            <button 
              onclick="window.location.href='/${lang}/${cityData?.province?.slug}/${cityData?.slug}/${restaurant.place_id}'"
              style="width: 100%; padding: 8px; background: hsl(var(--primary)); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
            >
              Bekijk details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayerRef.current);
      });
    } catch (error) {
      console.error("Error loading restaurant markers:", error);
    }
  }, [lang]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const maxAttempts = 50;

    const initializeMap = () => {
      // Wait for Leaflet to load
      if (typeof L === 'undefined') {
        if (attempts < maxAttempts) {
          attempts++;
          timeoutId = setTimeout(initializeMap, 100);
        }
        return;
      }

      if (mapContainerRef.current && !mapRef.current) {
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        const coords = COUNTRY_COORDS[lang] || COUNTRY_COORDS.nl;
        
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lon],
          zoom: coords.zoom,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Create layer for restaurant markers
        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        mapRef.current = map;

        // Handle map clicks
        map.on("click", async (e: any) => {
          await handleLocationClick(e.latlng.lat, e.latlng.lng);
        });

        // Fix sizing
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
            loadRestaurantMarkers();
          }
        }, 100);

        // Load markers when map moves
        map.on('moveend', () => {
          loadRestaurantMarkers();
        });
      }
    };

    initializeMap();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersLayerRef.current = null;
    };
  }, [lang, loadRestaurantMarkers]);

  const handleLocationClick = async (lat: number, lon: number) => {
    if (!mapRef.current) return;
    
    setIsProcessing(true);

    // Add temporary marker
    if (markerRef.current) {
      markerRef.current.remove();
    }
    const customIcon = createCustomIcon(true);
    if (customIcon) {
      markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapRef.current);
      markerRef.current.bindPopup("Restaurants laden...").openPopup();
    }

    try {
      // 1. Reverse geocode to get location details
      const locationData = await reverseGeocode(lat, lon);
      
      toast({
        title: "Locatie geselecteerd",
        description: `Zoeken naar restaurants bij ${locationData.display_name}...`,
      });

      // 2. Search for restaurants within 15km radius
      const restaurants = await searchNearbyRestaurants(lat, lon, 15);
      
      if (restaurants.length === 0) {
        toast({
          title: "Geen restaurants gevonden",
          description: "Er zijn geen restaurants gevonden in een straal van 2 km.",
          variant: "destructive",
        });
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        setIsProcessing(false);
        return;
      }

      // 3. Save restaurants to database (if they don't exist)
      const savedRestaurants = await saveRestaurants(restaurants) as any;
      
      if (!savedRestaurants || savedRestaurants.length === 0) {
        toast({
          title: "Fout",
          description: "Kon restaurants niet opslaan in de database.",
          variant: "destructive",
        });
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        setIsProcessing(false);
        return;
      }

      // 4. Get city information from the first saved restaurant
      const firstRestaurant = savedRestaurants[0];
      
      if (!firstRestaurant.city_id) {
        toast({
          title: "Fout",
          description: "Kon de stad niet bepalen voor deze locatie.",
          variant: "destructive",
        });
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Restaurants geladen!",
        description: `${savedRestaurants.length} restaurants gevonden en opgeslagen.`,
      });

      // 5. Navigate to city page
      const { data: cityData } = await (supabase as any)
        .from('cities')
        .select(`
          slug,
          province:provinces(slug)
        `)
        .eq('id', firstRestaurant.city_id)
        .single();

      if (cityData && cityData.province) {
        // Reload markers to show newly saved restaurants
        await loadRestaurantMarkers();
        navigate(`/${lang}/${cityData.province.slug}/${cityData.slug}`);
      }
    } catch (error) {
      console.error("Error processing location click:", error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het verwerken van de locatie.",
        variant: "destructive",
      });
    } finally {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Restaurants laden...</p>
            <p className="text-xs text-muted-foreground">Even geduld...</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[999]">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Klik op de kaart om restaurants te vinden</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;
