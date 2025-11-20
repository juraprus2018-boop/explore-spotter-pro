import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Utensils, LogIn, LogOut, Shield, Store, Navigation, GalleryHorizontalEnd, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

const Header = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [hasClaimedRestaurant, setHasClaimedRestaurant] = useState(false);
  const { isModerator } = useUserRole();
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkClaimedRestaurant(session.user.id);
      } else {
        setHasClaimedRestaurant(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkClaimedRestaurant(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkClaimedRestaurant = async (userId: string) => {
    const { data } = await (supabase as any)
      .from('restaurants')
      .select('id')
      .eq('owner_id', userId)
      .single();
    
    setHasClaimedRestaurant(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate(`/${lang || 'nl'}`);
  };

  const handleNearbyClick = () => {
    setIsNearbyLoading(true);
    if (!navigator.geolocation) {
      toast({
        title: "Niet ondersteund",
        description: "Je browser ondersteunt geolocatie niet.",
        variant: "destructive",
      });
      setIsNearbyLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        navigate(`/${lang || 'nl'}?lat=${latitude}&lon=${longitude}&nearby=true`);
        setIsNearbyLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Locatie toegang geweigerd",
          description: "Geef toegang tot je locatie om restaurants in de buurt te vinden.",
          variant: "destructive",
        });
        setIsNearbyLoading(false);
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${lang || 'nl'}`)}>
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">EatNavigator</span>
        </div>
        
        <nav className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNearbyClick}
            disabled={isNearbyLoading}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nearby.buttonShort')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/${lang || 'nl'}/cities`)}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t('cities.button')}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hidden md:inline-flex"
            onClick={() => navigate(`/${lang || i18n.language || 'nl'}/foodwall`)}
          >
            <GalleryHorizontalEnd className="h-4 w-4" />
            {t('foodwall.nav')}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.email?.split('@')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isModerator && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/${lang}/admin`)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {hasClaimedRestaurant && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/${lang}/owner-dashboard`)}>
                      <Store className="h-4 w-4 mr-2" />
                      Mijn Restaurant
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate(`/${lang}/add-restaurant`)}>
                  <Utensils className="h-4 w-4 mr-2" />
                  Restaurant toevoegen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${lang}/auth`)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Inloggen
            </Button>
          )}

          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};

export default Header;
