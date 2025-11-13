import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Globe, Utensils, LogIn, LogOut, Shield, Store } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
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
  const [user, setUser] = useState<any>(null);
  const [hasClaimedRestaurant, setHasClaimedRestaurant] = useState(false);
  const { isModerator } = useUserRole();

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

  const languages = [
    { code: "nl", name: "Nederlands" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
    { code: "hr", name: "Hrvatski" },
    { code: "pt", name: "Português" },
    { code: "pl", name: "Polski" },
  ];

  const changeLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    navigate(`/${newLang}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${lang || 'nl'}`)}>
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">RestaurantFinder</span>
        </div>
        
        <nav className="flex items-center gap-4">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {languages.find(l => l.code === lang)?.name || "Nederlands"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={lang === language.code ? "bg-accent" : ""}
                >
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default Header;
