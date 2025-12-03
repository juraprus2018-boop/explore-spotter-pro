import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { getRestaurantsByCity, getCityBySlug, DatabaseRestaurant, City } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Home, Filter as FilterIcon, Map } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HreflangAlternates from "@/components/HreflangAlternates";
import CityStructuredData from "@/components/CityStructuredData";
import CityStats from "@/components/CityStats";
import TopRestaurants from "@/components/TopRestaurants";
import RecentRestaurants from "@/components/RecentRestaurants";
import PopularCuisines from "@/components/PopularCuisines";
import PriceDistribution from "@/components/PriceDistribution";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

const CityPage = () => {
  const { city, province, lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [cityData, setCityData] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedDiet, setSelectedDiet] = useState<string>("all");
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!city) return;

      setIsLoading(true);
      try {
        const [cityResult, restaurantsResult] = await Promise.all([
          getCityBySlug(city),
          getRestaurantsByCity(city)
        ]);
        
        setCityData(cityResult);
        setRestaurants(restaurantsResult);

        if (restaurantsResult.length === 0) {
          toast({
            title: "Geen restaurants gevonden",
            description: `Er zijn nog geen restaurants gevonden in ${cityResult?.name || city}`,
            variant: "destructive",
          });
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
  }, [city, toast]);

  // Filter restaurants when filters change
  useEffect(() => {
    let filtered = [...restaurants];

    // Filter by cuisine
    if (selectedCuisine !== "all") {
      filtered = filtered.filter(r => (r as any).cuisine === selectedCuisine);
    }

    // Filter by facility
    if (selectedFacility !== "all") {
      filtered = filtered.filter(r => {
        const restaurant = r as any;
        switch (selectedFacility) {
          case "wheelchair":
            return restaurant.wheelchair === "yes";
          case "outdoor_seating":
            return restaurant.outdoor_seating === "yes";
          case "takeaway":
            return restaurant.takeaway === "yes";
          case "delivery":
            return restaurant.delivery === "yes";
          default:
            return true;
        }
      });
    }

    // Filter by diet
    if (selectedDiet !== "all") {
      filtered = filtered.filter(r => {
        const dietOptions = (r as any).diet_options;
        if (!dietOptions) return false;
        return dietOptions[selectedDiet] === "yes";
      });
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedCuisine, selectedFacility, selectedDiet]);

  // Get unique cuisines from restaurants
  const uniqueCuisines = Array.from(
    new Set(
      restaurants
        .map(r => (r as any).cuisine)
        .filter(c => c && c !== null)
    )
  ).sort();

  // Get available facilities from restaurants
  const availableFacilities = {
    wheelchair: restaurants.some(r => (r as any).wheelchair === "yes"),
    outdoor_seating: restaurants.some(r => (r as any).outdoor_seating === "yes"),
    takeaway: restaurants.some(r => (r as any).takeaway === "yes"),
    delivery: restaurants.some(r => (r as any).delivery === "yes"),
  };

  // Get available diet options from restaurants
  const availableDietOptions = {
    vegetarian: restaurants.some(r => (r as any).diet_options?.vegetarian === "yes"),
    vegan: restaurants.some(r => (r as any).diet_options?.vegan === "yes"),
    gluten_free: restaurants.some(r => (r as any).diet_options?.gluten_free === "yes"),
    halal: restaurants.some(r => (r as any).diet_options?.halal === "yes"),
    kosher: restaurants.some(r => (r as any).diet_options?.kosher === "yes"),
  };

  const hasAnyFacilities = Object.values(availableFacilities).some(v => v);
  const hasAnyDietOptions = Object.values(availableDietOptions).some(v => v);

  const clearFilters = () => {
    setSelectedCuisine("all");
    setSelectedFacility("all");
    setSelectedDiet("all");
  };

  const hasActiveFilters = selectedCuisine !== "all" || selectedFacility !== "all" || selectedDiet !== "all";

  const cityName = cityData?.name || city || "";
  const provinceName = cityData?.province?.name || province || "";
  const provinceSlug = cityData?.province?.slug || province || "";

  const displayRestaurants = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;
  
  // SEO meta tags
  const seoTitle = `${t('page.restaurantsIn')} ${cityName}, ${provinceName} | EatNavigator`;
  const seoDescription = `${t('page.discoverRestaurants')} ${cityName}, ${provinceName}. ${t('detail.aboutDesc')}`;

  const locations = displayRestaurants.map(r => ({
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    display_name: r.display_name,
    placeId: r.place_id,
    citySlug: r.city?.slug || city || '',
    provinceSlug: r.city?.province?.slug || provinceSlug,
  }));

  const mapCenter: [number, number] = displayRestaurants.length > 0
    ? [displayRestaurants[0].lat, displayRestaurants[0].lon]
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
      {cityData && restaurants.length > 0 && (
        <CityStructuredData 
          cityName={cityName} 
          provinceName={provinceName} 
          restaurants={restaurants}
        />
      )}
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
                <BreadcrumbPage>{cityName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                {t('page.restaurantsIn')} {cityName}
              </h1>
              <p className="text-muted-foreground text-lg">
                Ontdek {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} in {cityName}, {provinceName}
              </p>
            </div>
            
            {restaurants.length > 0 && (
              <CityStats restaurants={restaurants} />
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Restaurants laden...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-8">
              {/* Recent Restaurants */}
              <RecentRestaurants 
                restaurants={restaurants} 
                citySlug={city || ""} 
                provinceSlug={provinceSlug} 
              />

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PopularCuisines restaurants={restaurants} />
                <PriceDistribution restaurants={restaurants} />
              </div>
              
              {/* Top Restaurants */}
              <TopRestaurants citySlug={city || ""} provinceSlug={provinceSlug} />
              
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FilterIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="ml-auto"
                      >
                        Wis filters
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cuisine filter */}
                    {uniqueCuisines.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Keuken type</label>
                        <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                          <SelectTrigger>
                            <SelectValue placeholder="Alle keukens" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle keukens</SelectItem>
                            {uniqueCuisines.map(cuisine => (
                              <SelectItem key={cuisine} value={cuisine}>
                                {cuisine.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Facility filter */}
                    {hasAnyFacilities && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Faciliteiten</label>
                        <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                          <SelectTrigger>
                            <SelectValue placeholder="Alle faciliteiten" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle faciliteiten</SelectItem>
                            {availableFacilities.wheelchair && (
                              <SelectItem value="wheelchair">♿ Rolstoeltoegankelijk</SelectItem>
                            )}
                            {availableFacilities.outdoor_seating && (
                              <SelectItem value="outdoor_seating">🌤️ Terras</SelectItem>
                            )}
                            {availableFacilities.takeaway && (
                              <SelectItem value="takeaway">🥡 Afhalen</SelectItem>
                            )}
                            {availableFacilities.delivery && (
                              <SelectItem value="delivery">🚚 Bezorgen</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Diet filter */}
                    {hasAnyDietOptions && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Dieet opties</label>
                        <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                          <SelectTrigger>
                            <SelectValue placeholder="Alle diëten" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle diëten</SelectItem>
                            {availableDietOptions.vegetarian && (
                              <SelectItem value="vegetarian">🥗 Vegetarisch</SelectItem>
                            )}
                            {availableDietOptions.vegan && (
                              <SelectItem value="vegan">🌱 Veganistisch</SelectItem>
                            )}
                            {availableDietOptions.gluten_free && (
                              <SelectItem value="gluten_free">🌾 Glutenvrij</SelectItem>
                            )}
                            {availableDietOptions.halal && (
                              <SelectItem value="halal">☪️ Halal</SelectItem>
                            )}
                            {availableDietOptions.kosher && (
                              <SelectItem value="kosher">✡️ Koosjer</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {filteredRestaurants.length} van {restaurants.length} restaurants gevonden
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-foreground">
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

              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {hasActiveFilters ? `Gefilterde restaurants (${filteredRestaurants.length})` : 'Alle restaurants'}
                </h2>
                {displayRestaurants.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Geen restaurants gevonden met de geselecteerde filters.
                      </p>
                      <Button onClick={clearFilters} className="mt-4">
                        Wis filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.place_id}
                        placeId={restaurant.place_id}
                        name={restaurant.name}
                        displayName={restaurant.display_name}
                        lat={restaurant.lat}
                        lon={restaurant.lon}
                        type={restaurant.type || "restaurant"}
                        citySlug={cityData?.slug || city || ""}
                        provinceSlug={provinceSlug}
                        cuisine={(restaurant as any).cuisine}
                        openingHours={(restaurant as any).opening_hours}
                        facilities={{
                          wheelchair: (restaurant as any).wheelchair,
                          outdoor_seating: (restaurant as any).outdoor_seating,
                          takeaway: (restaurant as any).takeaway,
                          delivery: (restaurant as any).delivery,
                        }}
                        onViewOnMap={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    ))}
                  </div>
                )}
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
