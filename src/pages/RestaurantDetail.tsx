import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRestaurantByPlaceId, DatabaseRestaurant } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Home } from "lucide-react";
import MapView from "@/components/MapView";
import RouteNavigation from "@/components/RouteNavigation";
import ReviewSection from "@/components/ReviewSection";
import StructuredData from "@/components/StructuredData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);

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
        
        // Fetch reviews
        if (data) {
          const { data: reviewsData } = await (supabase as any)
            .from('reviews')
            .select('*')
            .eq('restaurant_id', data.id)
            .order('created_at', { ascending: false });
          
          if (reviewsData) {
            setReviews(reviewsData);
            const avg = reviewsData.length > 0 
              ? reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length 
              : 0;
            setAverageRating(avg);
          }
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
  }, [placeId, t, toast]);

  const handleClaimRestaurant = async () => {
    if (!currentUser || !restaurant) return;

    setIsClaiming(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          owner_id: currentUser.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: "Restaurant geclaimd!",
        description: "Je bent nu de eigenaar van dit restaurant.",
      });

      // Reload restaurant data
      const data = await getRestaurantByPlaceId(Number(placeId));
      setRestaurant(data);
    } catch (error: any) {
      console.error("Error claiming restaurant:", error);
      toast({
        title: "Fout bij claimen",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

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
      {restaurant && (
        <StructuredData 
          restaurant={restaurant} 
          reviews={reviews} 
          averageRating={averageRating}
        />
      )}
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
                
                {/* Ownership and Claim Section */}
                {(restaurant as any).owner_id ? (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Eigenaar</p>
                    <p className="font-medium text-primary">Geclaimd door eigenaar</p>
                  </div>
                ) : currentUser && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleClaimRestaurant} 
                      disabled={isClaiming}
                      className="w-full"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claimen...
                        </>
                      ) : (
                        "Claim dit restaurant"
                      )}
                    </Button>
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

          {/* Reviews Section */}
          <div className="mt-12">
            <ReviewSection 
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
