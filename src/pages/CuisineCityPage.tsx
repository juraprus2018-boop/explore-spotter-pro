import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { getCityBySlug, City } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Home, Map, Clock, UtensilsCrossed } from "lucide-react";
import { getOpenStatus } from "@/lib/openingHours";
import RestaurantCard from "@/components/RestaurantCard";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HreflangAlternates from "@/components/HreflangAlternates";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink } from "@/components/NavLink";

interface Restaurant {
  id: string;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  place_id: number;
  cuisine: string | null;
  type: string | null;
  wheelchair: string | null;
  outdoor_seating: string | null;
  takeaway: string | null;
  delivery: string | null;
  opening_hours: any;
  photos: string[] | null;
  city?: {
    slug: string;
    province?: {
      slug: string;
    };
  };
}

const CuisineCityPage = () => {
  const { city, province, cuisine, lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cityData, setCityData] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);
  const [showMap, setShowMap] = useState(true);

  // Remove "cuisine-" prefix from URL param
  const cuisineSlug = cuisine?.replace("cuisine-", "") || "";
  const cuisineName = cuisineSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    const loadData = async () => {
      if (!city || !cuisineSlug) return;

      setIsLoading(true);
      try {
        const cityResult = await getCityBySlug(city);
        setCityData(cityResult);

        if (cityResult) {
          const { data: restaurantsData, error } = await supabase
            .from("restaurants")
            .select(`
              id,
              name,
              display_name,
              lat,
              lon,
              place_id,
              cuisine,
              type,
              wheelchair,
              outdoor_seating,
              takeaway,
              delivery,
              opening_hours,
              photos,
              city:cities(
                slug,
                province:provinces(slug)
              )
            `)
            .eq("city_id", cityResult.id)
            .eq("status", "approved")
            .ilike("cuisine", `%${cuisineSlug.replace(/-/g, "_")}%`);

          if (error) throw error;

          setRestaurants(restaurantsData || []);

          if (!restaurantsData || restaurantsData.length === 0) {
            toast({
              title: "Geen restaurants gevonden",
              description: `Er zijn geen ${cuisineName} restaurants gevonden in ${cityResult.name}`,
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van restaurants.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [city, cuisineSlug, toast]);

  const filteredRestaurants = useMemo(() => {
    if (!showOpenOnly) return restaurants;
    return restaurants.filter(r => {
      const status = getOpenStatus(r.opening_hours);
      return status.isOpen === true;
    });
  }, [restaurants, showOpenOnly]);

  const openCount = useMemo(() => {
    return restaurants.filter(r => getOpenStatus(r.opening_hours).isOpen === true).length;
  }, [restaurants]);

  const cityName = cityData?.name || city || "";
  const provinceName = cityData?.province?.name || province || "";
  const provinceSlug = cityData?.province?.slug || province || "";

  // SEO meta tags
  const seoTitle = `${cuisineName} restaurants in ${cityName}, ${provinceName} | EatNavigator`;
  const seoDescription = `Ontdek ${restaurants.length} ${cuisineName} restaurants in ${cityName}, ${provinceName}. Vind de beste ${cuisineName} keukens bij jou in de buurt.`;

  const locations = filteredRestaurants.map(r => ({
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    display_name: r.display_name,
    placeId: r.place_id,
    citySlug: r.city?.slug || city || '',
    provinceSlug: r.city?.province?.slug || provinceSlug,
  }));

  const mapCenter: [number, number] = filteredRestaurants.length > 0
    ? [filteredRestaurants[0].lat, filteredRestaurants[0].lon]
    : [52.3676, 4.9041];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>
      <HreflangAlternates />
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
                <BreadcrumbLink asChild>
                  <NavLink to={`/${lang}/${provinceSlug}`}>
                    {provinceName}
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={`/${lang}/${provinceSlug}/${city}`}>
                    {cityName}
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{cuisineName} restaurants</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
                {cuisineName} restaurants in {cityName}
              </h1>
              <p className="text-muted-foreground text-lg">
                Ontdek {restaurants.length} {cuisineName} {restaurants.length === 1 ? "restaurant" : "restaurants"} in {cityName}, {provinceName}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Restaurants laden...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-8">
              {/* Open Now Filter */}
              <div className="flex items-center gap-4">
                <Button
                  variant={showOpenOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOpenOnly(!showOpenOnly)}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Nu open
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    showOpenOnly
                      ? 'bg-primary-foreground/20'
                      : 'bg-green-500/20 text-green-600'
                  }`}>
                    {openCount}
                  </span>
                </Button>
                {showOpenOnly && (
                  <span className="text-sm text-muted-foreground">
                    {filteredRestaurants.length} van {restaurants.length} restaurants
                  </span>
                )}
              </div>

              {/* Map */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("map.title")}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                    className="gap-2"
                  >
                    <Map className="h-4 w-4" />
                    {showMap ? "Verberg kaart" : "Toon kaart"}
                  </Button>
                </div>
                {showMap && (
                  <MapView
                    locations={locations}
                    center={mapCenter}
                    zoom={12}
                  />
                )}
              </div>

              {/* Restaurant List */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  {showOpenOnly ? `Nu open (${filteredRestaurants.length})` : `Alle ${cuisineName} restaurants`}
                </h2>
                {filteredRestaurants.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Er zijn momenteel geen open {cuisineName} restaurants. Probeer de filter uit te schakelen.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        placeId={restaurant.place_id}
                        name={restaurant.name}
                        displayName={restaurant.display_name}
                        lat={restaurant.lat}
                        lon={restaurant.lon}
                        type={restaurant.type || undefined}
                        citySlug={restaurant.city?.slug || city || ""}
                        provinceSlug={restaurant.city?.province?.slug || provinceSlug}
                        cuisine={restaurant.cuisine || undefined}
                        facilities={{
                          wheelchair: restaurant.wheelchair || undefined,
                          outdoor_seating: restaurant.outdoor_seating || undefined,
                          takeaway: restaurant.takeaway || undefined,
                          delivery: restaurant.delivery || undefined,
                        }}
                        openingHours={restaurant.opening_hours}
                        photos={restaurant.photos || undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Link back to city page */}
              <div className="pt-4">
                <NavLink to={`/${lang}/${provinceSlug}/${city}`}>
                  <Button variant="outline" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Bekijk alle restaurants in {cityName}
                  </Button>
                </NavLink>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Geen {cuisineName} restaurants gevonden</h2>
                <p className="text-muted-foreground mb-6">
                  Er zijn nog geen {cuisineName} restaurants gevonden in {cityName}.
                </p>
                <NavLink to={`/${lang}/${provinceSlug}/${city}`}>
                  <Button>Bekijk alle restaurants in {cityName}</Button>
                </NavLink>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CuisineCityPage;
