import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reverseGeocode, searchNearbyRestaurants } from "@/lib/nominatim";
import { saveRestaurants } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const InteractiveWorldMap = () => {
  const navigate = useNavigate();
  const { lang = "nl" } = useParams();
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([20, 0], 2);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Add click handler
    map.on("click", async (e) => {
      await handleLocationClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleLocationClick = async (lat: number, lon: number) => {
    if (!mapRef.current) return;
    
    setIsProcessing(true);

    // Add temporary marker
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
    markerRef.current.bindPopup("Restaurants laden...").openPopup();

    try {
      // 1. Reverse geocode to get location details
      const locationData = await reverseGeocode(lat, lon);
      
      toast({
        title: "Locatie geselecteerd",
        description: `Zoeken naar restaurants bij ${locationData.display_name}...`,
      });

      // 2. Search for restaurants within 2km radius
      const restaurants = await searchNearbyRestaurants(lat, lon, 2);
      
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
