import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllProvinces, Province } from "@/lib/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

const ProvincesOverview = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();

  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoading(true);
      const data = await getAllProvinces();
      setProvinces(data);
      setIsLoading(false);
    };

    loadProvinces();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Populaire provincies
          </CardTitle>
          <CardDescription>Ontdek restaurants per provincie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (provinces.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Populaire provincies
        </CardTitle>
        <CardDescription>Ontdek restaurants per provincie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {provinces.map((province) => (
            <Button
              key={province.id}
              variant="outline"
              className="h-auto py-3 px-4 justify-start"
              onClick={() => navigate(`/${lang}/${province.slug}`)}
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{province.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProvincesOverview;
