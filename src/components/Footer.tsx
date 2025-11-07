import { useTranslation } from "react-i18next";
import { Utensils } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">RestaurantFinder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.home")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.info")}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.terms")}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {currentYear} RestaurantFinder. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
