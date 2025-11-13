import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface NearbyRestaurantsProps {
  onNearbySearch: () => Promise<void>;
}

const NearbyRestaurants = ({ onNearbySearch }: NearbyRestaurantsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  const handleNearbyClick = async () => {
    setIsLoading(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast({
          title: t("nearby.notSupported"),
          description: t("nearby.notSupportedDesc"),
          variant: "destructive",
        });
        return;
      }

      // Request permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);

      if (permission.state === 'denied') {
        toast({
          title: t("nearby.permissionDenied"),
          description: t("nearby.permissionDeniedDesc"),
          variant: "destructive",
        });
        return;
      }

      await onNearbySearch();
    } catch (error) {
      console.error("Error in nearby search:", error);
      toast({
        title: t("nearby.error"),
        description: t("nearby.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          {t("nearby.title")}
        </CardTitle>
        <CardDescription>
          {t("nearby.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleNearbyClick}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("nearby.searching")}
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              {t("nearby.button")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NearbyRestaurants;
