import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin } from "lucide-react";
import { getCitiesByCountryCode, City } from "@/lib/database";
import { getCountryCodeFromLanguage } from "@/lib/countryMapping";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HreflangAlternates from "@/components/HreflangAlternates";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CitiesPage = () => {
  const { lang = "nl" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const countryCode = getCountryCodeFromLanguage(lang);

  useEffect(() => {
    const loadCities = async () => {
      setIsLoading(true);
      try {
        const data = await getCitiesByCountryCode(countryCode);
        setCities(data);
        
        if (data.length === 0) {
          toast({
            title: t("toast.error"),
            description: t("cities.noCities"),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        toast({
          title: t("toast.error"),
          description: t("toast.loadError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, [countryCode, t, toast]);

  const handleCityClick = (city: City) => {
    if (city.province) {
      navigate(`/${lang}/${city.province.slug}/${city.slug}`);
    }
  };

  const pageTitle = t("cities.pageTitle");
  const pageDescription = t("cities.pageDescription", { count: cities.length });

  return (
    <>
      <Helmet>
        <title>{pageTitle} - EatNavigator</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={`${pageTitle} - EatNavigator`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HreflangAlternates />
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate(`/${lang}`)} className="cursor-pointer">
                  {t("breadcrumb.home")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("cities.breadcrumb")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground">{pageDescription}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cities.map((city) => (
                <Card
                  key={city.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => handleCityClick(city)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg text-foreground">{city.name}</h3>
                    </div>
                    {city.province && (
                      <p className="text-sm text-muted-foreground">{city.province.name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("cities.noCities")}</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CitiesPage;
