import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRestaurantsByCity, DatabaseRestaurant } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Home } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink } from "@/components/NavLink";

const CityPage = () => {
  const { city, lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      if (!city) return;

      setIsLoading(true);
      try {
        const cityDecoded = decodeURIComponent(city);
        const data = await getRestaurantsByCity(cityDecoded);
        setRestaurants(data);

        if (data.length === 0) {
          toast({
            title: "Geen restaurants gevonden",
            description: `Er zijn nog geen restaurants gevonden in ${cityDecoded}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading restaurants:", error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van restaurants.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, [city, toast]);

  const cityName = city ? decodeURIComponent(city) : "";

  const locations = restaurants.map(r => ({
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    display_name: r.display_name,
  }));

  const mapCenter: [number, number] = restaurants.length > 0
    ? [restaurants[0].lat, restaurants[0].lon]
    : [52.3676, 4.9041];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={`/${lang}`}>
                    <Home className="h-4 w-4" />
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{cityName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              Restaurants in {cityName}
            </h1>
            <p className="text-muted-foreground text-lg">
              {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} gevonden
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Restaurants laden...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {t("map.title")}
                </h2>
                <MapView
                  locations={locations}
                  center={mapCenter}
                  zoom={12}
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  Alle restaurants
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.place_id}
                      placeId={restaurant.place_id}
                      name={restaurant.name}
                      displayName={restaurant.display_name}
                      lat={restaurant.lat}
                      lon={restaurant.lon}
                      type={restaurant.type || "restaurant"}
                      city={restaurant.city}
                      onViewOnMap={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">
                Geen restaurants gevonden
              </h3>
              <p className="text-muted-foreground max-w-md">
                Er zijn nog geen restaurants gevonden in {cityName}. Probeer een andere stad of gebruik de zoekfunctie.
              </p>
              <Button onClick={() => navigate(`/${lang}`)} className="mt-6">
                Terug naar zoeken
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CityPage;
