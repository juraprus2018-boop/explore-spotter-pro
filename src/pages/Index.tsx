import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import RestaurantCard from "@/components/RestaurantCard";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CitiesOverview from "@/components/CitiesOverview";
import { searchRestaurants, searchNearbyRestaurants, NominatimResult } from "@/lib/nominatim";
import { saveRestaurants, searchRestaurantsInDatabase, getNearbyRestaurants, DatabaseRestaurant } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Utensils, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { t } = useTranslation();
  const [results, setResults] = useState<NominatimResult[]>([]);
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

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      // First, try to search in database
      const dbResults = await searchRestaurantsInDatabase(query);
      
      let searchResults: NominatimResult[] = [];
      
      if (dbResults.length > 0) {
        // Convert database results to Nominatim format
        searchResults = dbResults.map(r => ({
          place_id: r.place_id,
          name: r.name,
          display_name: r.display_name,
          lat: r.lat.toString(),
          lon: r.lon.toString(),
          type: r.type || "restaurant",
          class: "amenity",
          osm_type: r.osm_type || "node",
          osm_id: r.osm_id || 0,
          licence: "",
          place_rank: 0,
          importance: 0,
          addresstype: r.address_type || "amenity",
          boundingbox: ["0", "0", "0", "0"],
        }));
        
        toast({
          title: t("toast.resultsFound"),
          description: `${dbResults.length} restaurants gevonden in database`,
        });
      } else {
        // If not in database, search via Nominatim API
        searchResults = await searchRestaurants(query);
        
        // Save to database
        if (searchResults.length > 0) {
          await saveRestaurants(searchResults);
        }
        
        toast({
          title: t("toast.resultsFound"),
          description: t("toast.resultsFoundDesc", { count: searchResults.length, query }),
        });
      }
      
      setResults(searchResults);
      
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        setMapCenter([parseFloat(firstResult.lat), parseFloat(firstResult.lon)]);
        setMapZoom(12);
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
      const dbResults = await getNearbyRestaurants(userLocation[0], userLocation[1], 10);
      
      let searchResults: NominatimResult[] = [];
      
      if (dbResults.length > 0) {
        // Convert database results to Nominatim format
        searchResults = dbResults.map(r => ({
          place_id: r.place_id,
          name: r.name,
          display_name: r.display_name,
          lat: r.lat.toString(),
          lon: r.lon.toString(),
          type: r.type || "restaurant",
          class: "amenity",
          osm_type: r.osm_type || "node",
          osm_id: r.osm_id || 0,
          licence: "",
          place_rank: 0,
          importance: 0,
          addresstype: r.address_type || "amenity",
          boundingbox: ["0", "0", "0", "0"],
        }));
        
        toast({
          title: "Restaurants in de buurt",
          description: `${dbResults.length} restaurants gevonden in database`,
        });
      } else {
        // If not in database, search via Nominatim API
        searchResults = await searchNearbyRestaurants(userLocation[0], userLocation[1], 10);
        
        // Save to database
        if (searchResults.length > 0) {
          await saveRestaurants(searchResults);
        }
        
        toast({
          title: "Restaurants in de buurt",
          description: `${searchResults.length} restaurants gevonden via API en opgeslagen`,
        });
      }
      
      if (searchResults.length > 0) {
        setResults(searchResults);
        setMapCenter(userLocation);
        setMapZoom(12);
      } else {
        toast({
          title: "Geen restaurants gevonden",
          description: "Probeer een andere locatie of vergroot de zoekradius.",
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
    setMapZoom(14);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const locations = results.map(result => ({
    name: result.name || result.display_name.split(',')[0],
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    display_name: result.display_name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Hero onSearch={handleSearch} />
      
      {userLocation && (
        <div className="container mx-auto px-4 pt-8">
          <Button 
            onClick={handleNearbySearch} 
            variant="outline" 
            size="lg"
            disabled={isLoading}
          >
            <Navigation className="h-5 w-5 mr-2" />
            {t("search.nearby")}
          </Button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t("results.searching")}</p>
          </div>
        ) : results.length > 0 ? (
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
                {t("results.title")} ({results.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <RestaurantCard
                    key={result.place_id}
                    placeId={result.place_id}
                    name={result.name || result.display_name.split(',')[0]}
                    displayName={result.display_name}
                    lat={parseFloat(result.lat)}
                    lon={parseFloat(result.lon)}
                    type={result.type}
                    onViewOnMap={() => handleViewOnMap(parseFloat(result.lat), parseFloat(result.lon))}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <CitiesOverview />
            
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
