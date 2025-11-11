import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { reverseGeocode, NominatimResult } from "@/lib/nominatim";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, MapPin, Globe, Phone, Clock } from "lucide-react";
import MapView from "@/components/MapView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const RestaurantDetail = () => {
  const { placeId, lang } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<NominatimResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!placeId) return;
      
      setIsLoading(true);
      try {
        // Get restaurant data from navigation state
        const stateData = routerLocation.state as any;
        
        if (stateData && stateData.name) {
          // Use data passed from the card
          setRestaurant({
            place_id: stateData.placeId,
            name: stateData.name,
            display_name: stateData.displayName,
            lat: stateData.lat.toString(),
            lon: stateData.lon.toString(),
            type: stateData.type || "restaurant",
            class: "amenity",
            osm_type: "node",
            osm_id: 0,
            licence: "",
            place_rank: 0,
            importance: 0,
            addresstype: "amenity",
            boundingbox: ["0", "0", "0", "0"],
          });
        } else {
          // Fallback if no state data
          toast({
            title: t("detail.error"),
            description: t("detail.errorDesc"),
            variant: "destructive",
          });
        }
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
  }, [placeId, routerLocation.state, t, toast]);

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
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.backToSearch")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const location = {
    name: restaurant.name || restaurant.display_name.split(',')[0],
    lat: parseFloat(restaurant.lat),
    lon: parseFloat(restaurant.lon),
    display_name: restaurant.display_name,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button 
            onClick={() => navigate(`/${lang}`)} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.backToSearch")}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">{location.name}</CardTitle>
                  <CardDescription className="flex items-start gap-2 text-base">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    {restaurant.display_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("detail.about")}</h3>
                    <p className="text-muted-foreground">
                      {t("detail.aboutDesc")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("detail.location")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapView 
                    locations={[location]}
                    center={[location.lat, location.lon]}
                    zoom={15}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("detail.information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("detail.address")}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.display_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("detail.coordinates")}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("detail.phone")}</p>
                      <p className="text-sm text-muted-foreground">{t("detail.notAvailable")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("detail.hours")}</p>
                      <p className="text-sm text-muted-foreground">{t("detail.notAvailable")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RestaurantDetail;
