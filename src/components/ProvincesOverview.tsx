import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DUTCH_PROVINCES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const ProvincesOverview = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t("provinces.title")}
        </CardTitle>
        <CardDescription>{t("provinces.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {DUTCH_PROVINCES.map((province) => (
            <Button
              key={province.slug}
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
