import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRestaurantByPlaceId, DatabaseRestaurant } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Home } from "lucide-react";
import MapView from "@/components/MapView";
import RouteNavigation from "@/components/RouteNavigation";
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

const RestaurantDetail = () => {
  const { placeId, city, province, lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<DatabaseRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!placeId) return;
      
      setIsLoading(true);
      try {
        const data = await getRestaurantByPlaceId(Number(placeId));
        
        if (!data) {
          toast({
            title: t("detail.error"),
            description: t("detail.errorDesc"),
            variant: "destructive",
          });
        }
        
        setRestaurant(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading restaurant:", error);
        toast({
          title: t("detail.error"),
          description: t("detail.errorDesc"),
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadRestaurant();
  }, [placeId, t, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("detail.loading")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">{t("detail.notFound")}</p>
          <Button onClick={() => navigate(`/${lang}`)} className="mt-4">
            {t("detail.backToSearch")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const location = {
    name: restaurant.name,
    lat: restaurant.lat,
    lon: restaurant.lon,
    display_name: restaurant.display_name,
  };

  const cityName = restaurant.city?.name || city || '';
  const citySlug = restaurant.city?.slug || city || '';
  const provinceName = restaurant.city?.province?.name || province || '';
  const provinceSlug = restaurant.city?.province?.slug || province || '';

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
                <BreadcrumbLink asChild>
                  <NavLink to={`/${lang}/${provinceSlug}`}>
                    {provinceName}
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={`/${lang}/${provinceSlug}/${citySlug}`}>
                    {cityName}
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{restaurant.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">{restaurant.name}</h1>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-lg">{restaurant.display_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("detail.coordinates")}</p>
                  <p className="font-medium">
                    {restaurant.lat.toFixed(6)}, {restaurant.lon.toFixed(6)}
                  </p>
                </div>
                {restaurant.type && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("detail.type")}</p>
                    <p className="font-medium capitalize">{restaurant.type}</p>
                  </div>
                )}
                {cityName && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Stad</p>
                    <p className="font-medium">{cityName}</p>
                  </div>
                )}
                {provinceName && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Provincie</p>
                    <p className="font-medium">{provinceName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("detail.location")}</CardTitle>
                <CardDescription>{t("detail.locationDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <MapView 
                    locations={[location]} 
                    center={[restaurant.lat, restaurant.lon]} 
                    zoom={15} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t("detail.directions")}</h2>
            <RouteNavigation
              destinationLat={restaurant.lat}
              destinationLon={restaurant.lon}
              destinationName={restaurant.name}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
