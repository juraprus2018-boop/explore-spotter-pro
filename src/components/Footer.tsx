import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import SitemapGenerator from "./SitemapGenerator";

const Footer = () => {
  const { t } = useTranslation();
  const { lang = 'en' } = useParams();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">EatNavigator</span>
          </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={`/${lang}`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.home")}</Link></li>
              <li><Link to={`/${lang}/about`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.about")}</Link></li>
              <li><Link to={`/${lang}/foodwall`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.foodwall")}</Link></li>
              <li><Link to={`/${lang}/contact`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.info")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={`/${lang}/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to={`/${lang}/terms`} className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.terms")}</Link></li>
              <li className="pt-2"><SitemapGenerator /></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {currentYear} EatNavigator. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
