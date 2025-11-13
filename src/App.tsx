import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import CityPage from "./pages/CityPage";
import ProvincePage from "./pages/ProvincePage";
import NotFound from "./pages/NotFound";
import LanguageRedirect from "./pages/LanguageRedirect";
import Auth from "./pages/Auth";
import AddRestaurant from "./pages/AddRestaurant";

const queryClient = new QueryClient();

const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ["nl", "en", "de", "fr", "es", "it", "hr", "pt", "pl"].includes(lang)) {
      i18n.changeLanguage(lang);
    }
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
