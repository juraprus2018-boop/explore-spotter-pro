import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "./lib/languages";
import { usePageTracking } from "./hooks/usePageTracking";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import CityPage from "./pages/CityPage";
import CitiesPage from "./pages/CitiesPage";
import ProvincePage from "./pages/ProvincePage";
import NotFound from "./pages/NotFound";
import LanguageRedirect from "./pages/LanguageRedirect";
import Auth from "./pages/Auth";
import AddRestaurant from "./pages/AddRestaurant";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FoodWall from "./pages/FoodWall";

const queryClient = new QueryClient(); 

const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  usePageTracking();

  useEffect(() => {
    const targetLang = (lang && isSupportedLanguage(lang)) ? lang : DEFAULT_LANGUAGE;
    i18n.changeLanguage(targetLang);
    
    // Set HTML lang attribute based on language
    const langMap: Record<string, string> = {
      nl: "nl-NL",
      en: "en-US",
      de: "de-DE",
      fr: "fr-FR",
      es: "es-ES",
      it: "it-IT",
      pt: "pt-PT",
      pl: "pl-PL",
      hr: "hr-HR",
      ja: "ja-JP",
      zh: "zh-CN",
      ar: "ar-SA",
      tr: "tr-TR",
      sv: "sv-SE",
      da: "da-DK",
      no: "no-NO",
      fi: "fi-FI",
      cs: "cs-CZ",
      ro: "ro-RO",
    };
    document.documentElement.lang = langMap[targetLang] || "en-US";
  }, [lang, i18n]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LanguageRedirect />} />
          <Route
            path="/:lang"
            element={
              <LanguageWrapper>
                <Index />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/cities"
            element={
              <LanguageWrapper>
                <CitiesPage />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/:province"
            element={
              <LanguageWrapper>
                <ProvincePage />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/:province/:city"
            element={
              <LanguageWrapper>
                <CityPage />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/auth"
            element={
              <LanguageWrapper>
                <Auth />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/add-restaurant"
            element={
              <LanguageWrapper>
                <AddRestaurant />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/admin"
            element={
              <LanguageWrapper>
                <AdminDashboard />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/owner-dashboard"
            element={
              <LanguageWrapper>
                <OwnerDashboard />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/contact"
            element={
              <LanguageWrapper>
                <Contact />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/foodwall"
            element={
              <LanguageWrapper>
                <FoodWall />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/about"
            element={
              <LanguageWrapper>
                <About />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/privacy"
            element={
              <LanguageWrapper>
                <Privacy />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/terms"
            element={
              <LanguageWrapper>
                <Terms />
              </LanguageWrapper>
            }
          />
          <Route
            path="/:lang/:province/:city/:placeId"
            element={
              <LanguageWrapper>
                <RestaurantDetail />
              </LanguageWrapper>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
