import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import RestaurantCard from "@/components/RestaurantCard";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProvincesOverview from "@/components/ProvincesOverview";
import NearbyRestaurants from "@/components/NearbyRestaurants";
import HreflangAlternates from "@/components/HreflangAlternates";
import LanguageDetectionPopup from "@/components/LanguageDetectionPopup";
import { searchRestaurants, searchNearbyRestaurants } from "@/lib/nominatim";
import { saveRestaurants, searchRestaurantsInDatabase, getNearbyRestaurants, DatabaseRestaurant } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const [dbResults, setDbResults] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.3676, 4.9041]);
  const [mapZoom, setMapZoom] = useState(6);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, []);

  const handleSearch = async (query: string, location?: { lat: number; lon: number }) => {
    setIsLoading(true);
    try {
      let results: DatabaseRestaurant[] = [];

      // If location is provided, search restaurants near that location
      if (location) {
        // First try database
        results = await getNearbyRestaurants(location.lat, location.lon, 25);
        
        if (results.length === 0) {
          // Search via API if not in database
          const apiResults = await searchNearbyRestaurants(location.lat, location.lon, 25);
          
          if (apiResults.length > 0) {
            await saveRestaurants(apiResults);
            results = await getNearbyRestaurants(location.lat, location.lon, 25);
          }
        }

        setMapCenter([location.lat, location.lon]);
        setMapZoom(12);
      } else {
        // Regular text search
        results = await searchRestaurantsInDatabase(query);
        
        if (results.length === 0) {
          const apiResults = await searchRestaurants(query);
          
          if (apiResults.length > 0) {
            await saveRestaurants(apiResults);
            results = await searchRestaurantsInDatabase(query);
          }
        }

        if (results.length > 0) {
          setMapCenter([results[0].lat, results[0].lon]);
          setMapZoom(12);
        }
      }
      
      setDbResults(results);
      
      if (results.length > 0) {
        toast({
          title: t("toast.resultsFound"),
          description: t("toast.resultsFoundDesc", { count: results.length, query }),
        });
      } else {
        toast({
          title: t("toast.noResults"),
          description: t("toast.noResultsDesc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("toast.searchError"),
        description: t("toast.searchErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNearbySearch = async () => {
    if (!userLocation) {
      toast({
        title: "Locatie niet beschikbaar",
        description: "Geef toestemming voor locatietoegang om restaurants in de buurt te vinden.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, try to search in database
      let results = await getNearbyRestaurants(userLocation[0], userLocation[1], 25);
      
      if (results.length > 0) {
        toast({
          title: "Restaurants in de buurt",
          description: `${results.length} restaurants gevonden in database`,
        });
      } else {
        // If not in database, search via Nominatim API
        const apiResults = await searchNearbyRestaurants(userLocation[0], userLocation[1], 25);
        
        // Save to database
        if (apiResults.length > 0) {
          await saveRestaurants(apiResults);
          // Fetch again from database to get full data with relations
          results = await getNearbyRestaurants(userLocation[0], userLocation[1], 10);
        }
        
        toast({
          title: "Restaurants in de buurt",
          description: `${results.length} restaurants gevonden`,
        });
      }
      
      setDbResults(results);
      setMapCenter(userLocation);
      setMapZoom(13);
      
      if (results.length === 0) {
        toast({
          title: "Geen restaurants gevonden",
          description: "Probeer het opnieuw of zoek handmatig naar restaurants.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fout bij zoeken",
        description: "Er is een fout opgetreden bij het zoeken naar restaurants in de buurt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnMap = (lat: number, lon: number) => {
    setMapCenter([lat, lon]);
    setMapZoom(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const locations = dbResults.map(r => ({
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    display_name: r.display_name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HreflangAlternates />
      <LanguageDetectionPopup />
      <Header />
      <Hero onSearch={handleSearch} />
      <div className="container mx-auto px-4 py-12">
        {userLocation && dbResults.length === 0 && (
          <NearbyRestaurants onNearbySearch={handleNearbySearch} />
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t("results.loading")}</p>
          </div>
        ) : dbResults.length > 0 ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                {t("map.title")}
              </h2>
              <MapView
                locations={locations}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                {t("results.title")} ({dbResults.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbResults.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.place_id}
                    placeId={restaurant.place_id}
                    name={restaurant.name}
                    displayName={restaurant.display_name}
                    lat={restaurant.lat}
                    lon={restaurant.lon}
                    type={restaurant.type || "restaurant"}
                    citySlug={restaurant.city?.slug || "unknown"}
                    provinceSlug={restaurant.city?.province?.slug || "unknown"}
                    onViewOnMap={() => handleViewOnMap(restaurant.lat, restaurant.lon)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <ProvincesOverview />
            
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Utensils className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">
                {t("results.noResults")}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {t("results.noResultsDesc")}
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
