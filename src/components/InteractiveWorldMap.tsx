import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { reverseGeocode, searchNearbyRestaurants } from "@/lib/nominatim";
import { saveRestaurants } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ClickHandlerProps {
  onLocationClick: (lat: number, lon: number) => void;
}

function ClickHandler({ onLocationClick }: ClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const InteractiveWorldMap = () => {
  const navigate = useNavigate();
  const { lang = "nl" } = useParams();
  const { toast } = useToast();
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLocationClick = async (lat: number, lon: number) => {
    setClickedPosition([lat, lon]);
    setIsProcessing(true);

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
      setIsProcessing(false);
      setClickedPosition(null);
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border shadow-lg">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationClick={handleLocationClick} />
        
        {clickedPosition && (
          <Marker position={clickedPosition}>
            <Popup>Restaurants laden...</Popup>
          </Marker>
        )}
      </MapContainer>

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Restaurants laden...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveWorldMap;
