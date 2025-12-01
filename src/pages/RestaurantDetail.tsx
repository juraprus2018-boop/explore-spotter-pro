import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { getRestaurantByPlaceId, DatabaseRestaurant } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Home } from "lucide-react";
import MapView from "@/components/MapView";
import RouteNavigation from "@/components/RouteNavigation";
import ReviewSection from "@/components/ReviewSection";
import StructuredData from "@/components/StructuredData";
import HreflangAlternates from "@/components/HreflangAlternates";
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
import ClaimRestaurantDialog from "@/components/ClaimRestaurantDialog";
import SuggestChangeDialog from "@/components/SuggestChangeDialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { PriceRangeIndicator } from "@/components/PriceRangeIndicator";
import { SimilarRestaurants } from "@/components/SimilarRestaurants";
import { PhotoGallery } from "@/components/PhotoGallery";
import { OpeningHoursDisplay } from "@/components/OpeningHoursDisplay";
import { ReviewStatistics } from "@/components/ReviewStatistics";

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

  const refreshRestaurant = async () => {
    if (!placeId) return;
    const data = await getRestaurantByPlaceId(Number(placeId));
    setRestaurant(data);
  };

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

  const cityName = restaurant.city?.name || city || '';
  const citySlug = restaurant.city?.slug || city || '';
  const provinceName = restaurant.city?.province?.name || province || '';
  const provinceSlug = restaurant.city?.province?.slug || province || '';

  const location = {
    name: restaurant.name,
    lat: restaurant.lat,
    lon: restaurant.lon,
    display_name: restaurant.display_name,
    placeId: restaurant.place_id,
    citySlug,
    provinceSlug,
  };
  
  // SEO meta tags
  const seoTitle = `${restaurant.name} - ${cityName} | EatNavigator`;
  const seoDescription = restaurant.cuisine 
    ? `${restaurant.name} in ${cityName}. ${restaurant.cuisine} restaurant. Bekijk menu, openingstijden, reviews en locatie op EatNavigator.`
    : `${restaurant.name} in ${cityName}. Bekijk menu, openingstijden, reviews en locatie op EatNavigator.`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="restaurant" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>
      <HreflangAlternates />
      <StructuredData restaurant={restaurant} reviews={reviews} averageRating={averageRating} />
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 text-foreground">{restaurant.name}</h1>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-lg">{restaurant.display_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton restaurantId={restaurant.id} restaurantName={restaurant.name} />
                <SocialShareButtons 
                  restaurantName={restaurant.name} 
                  restaurantUrl={`/${lang}/${province}/${city}/${restaurant.place_id}`} 
                />
              </div>
            </div>
            {(restaurant as any).price_range && (
              <div className="mt-4">
                <PriceRangeIndicator priceRange={(restaurant as any).price_range} />
              </div>
            )}
          </div>

          {/* Restaurant Photos */}
          <PhotoGallery 
            photos={(restaurant as any).photos || []} 
            restaurantName={restaurant.name}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left column: Restaurant Information */}
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
                {(restaurant as any).cuisine && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Keuken type</p>
                    <p className="font-medium capitalize">{(restaurant as any).cuisine.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {(restaurant as any).brand && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Merk</p>
                    <p className="font-medium">{(restaurant as any).brand}</p>
                  </div>
                )}
                {(restaurant as any).phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefoonnummer</p>
                    <a href={`tel:${(restaurant as any).phone}`} className="font-medium text-primary hover:underline">
                      {(restaurant as any).phone}
                    </a>
                  </div>
                )}
                {(restaurant as any).website && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Website</p>
                    <a 
                      href={(restaurant as any).website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Bezoek website
                    </a>
                  </div>
                )}
                
                {/* Facilities */}
                {((restaurant as any).wheelchair || (restaurant as any).outdoor_seating || (restaurant as any).takeaway || (restaurant as any).delivery) && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Faciliteiten</p>
                    <div className="flex flex-wrap gap-2">
                      {(restaurant as any).wheelchair === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                          ♿ Rolstoeltoegankelijk
                        </span>
                      )}
                      {(restaurant as any).outdoor_seating === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                          🌤️ Terras
                        </span>
                      )}
                      {(restaurant as any).takeaway === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                          🥡 Afhalen
                        </span>
                      )}
                      {(restaurant as any).delivery === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                          🚚 Bezorgen
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Diet Options */}
                {(restaurant as any).diet_options && Object.keys((restaurant as any).diet_options).length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Dieetopties</p>
                    <div className="flex flex-wrap gap-2">
                      {(restaurant as any).diet_options.vegetarian === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-700 dark:text-green-400">
                          🥗 Vegetarisch
                        </span>
                      )}
                      {(restaurant as any).diet_options.vegan === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-700 dark:text-green-400">
                          🌱 Veganistisch
                        </span>
                      )}
                      {(restaurant as any).diet_options.gluten_free === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-700 dark:text-green-400">
                          🌾 Glutenvrij
                        </span>
                      )}
                      {(restaurant as any).diet_options.halal === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-700 dark:text-green-400">
                          ☪️ Halal
                        </span>
                      )}
                      {(restaurant as any).diet_options.kosher === 'yes' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-700 dark:text-green-400">
                          ✡️ Koosjer
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {cityName && (
                  <div className="pt-4 border-t">
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
                {(restaurant as any).claim_status === 'approved' && (restaurant as any).owner_id ? (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-primary">Geclaimd en geverifieerd</p>
                  </div>
                ) : (restaurant as any).claim_status === 'pending' && (restaurant as any).owner_id ? (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-yellow-600">Claim in behandeling</p>
                  </div>
                ) : currentUser && !(restaurant as any).owner_id ? (
                  <div className="pt-4 border-t">
                    <ClaimRestaurantDialog
                      restaurantId={restaurant.id}
                      restaurantName={restaurant.display_name}
                      onClaimed={refreshRestaurant}
                    />
                  </div>
                ) : null}
                
                {/* Suggest Changes Section */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Klopt er iets niet?</p>
                  <SuggestChangeDialog
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right column: Navigation and Location */}
            <div className="space-y-6 sticky top-4 self-start">
              <RouteNavigation
                destinationLat={restaurant.lat}
                destinationLon={restaurant.lon}
                destinationName={restaurant.name}
              />

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

              <OpeningHoursDisplay openingHours={(restaurant as any).opening_hours} />
            </div>
          </div>

          {/* Reviews Statistics */}
          <div className="mt-12">
            <ReviewStatistics reviews={reviews} />
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <ReviewSection 
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          </div>

          {/* Similar Restaurants Section */}
          <SimilarRestaurants
            restaurantId={restaurant.id}
            lat={restaurant.lat}
            lon={restaurant.lon}
            cuisine={(restaurant as any).cuisine}
            priceRange={(restaurant as any).price_range}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
