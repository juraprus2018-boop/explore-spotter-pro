import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { getCitiesByProvince, getProvinceBySlug, City } from "@/lib/database";
import { DUTCH_PROVINCES } from "@/lib/constants";
import { Loader2, MapPin, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HreflangAlternates from "@/components/HreflangAlternates";
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

const ProvincePage = () => {
  const { province, lang } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get province name from hardcoded list
  const provinceData = DUTCH_PROVINCES.find(p => p.slug === province);

  useEffect(() => {
    const loadData = async () => {
      if (!province) return;

      setIsLoading(true);
      try {
        const citiesResult = await getCitiesByProvince(province);
        setCities(citiesResult);

        if (citiesResult.length === 0) {
          toast({
            title: "Geen steden gevonden",
            description: `Er zijn nog geen steden met restaurants in ${provinceData?.name || province}. Probeer een restaurant te zoeken om data toe te voegen.`,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van steden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [province, toast, provinceData?.name]);

  const handleCityClick = (citySlug: string) => {
    navigate(`/${lang}/${province}/${citySlug}`);
  };
  
  // SEO meta tags
  const seoTitle = `${t('page.citiesIn')} ${provinceData?.name || province} | EatNavigator`;
  const seoDescription = `${t('page.discoverCities', { count: cities.length })} ${provinceData?.name || province}. ${t('detail.aboutDesc')}`;

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
                <BreadcrumbPage>{provinceData?.name || province}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              {t('page.citiesIn')} {provinceData?.name || province}
            </h1>
            <p className="text-muted-foreground text-lg">
              {cities.length} {cities.length === 1 ? "stad" : "steden"} gevonden
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Steden laden...</p>
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <Card 
                  key={city.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCityClick(city.slug)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {city.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Klik om restaurants in {city.name} te bekijken
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">
                Geen steden gevonden
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Er zijn nog geen steden met restaurants in {provinceData?.name || province}.
              </p>
              <p className="text-sm text-muted-foreground">
                Gebruik de zoekfunctie op de homepage om restaurants toe te voegen aan de database.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProvincePage;
