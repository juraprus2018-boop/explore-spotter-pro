import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LanguageRedirect = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Get browser language or use default
    const browserLang = navigator.language.split("-")[0];
    const supportedLangs = ["nl", "en", "de", "fr"];
    const defaultLang = "nl";
    
    // Use browser language if supported, otherwise use default
    const targetLang = supportedLangs.includes(browserLang) ? browserLang : defaultLang;
    
    // Set the language
    i18n.changeLanguage(targetLang);
    
    // Redirect to language-specific route
    navigate(`/${targetLang}`, { replace: true });
  }, [navigate, i18n]);

  return null;
};

export default LanguageRedirect;
