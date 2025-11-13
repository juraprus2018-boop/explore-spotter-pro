import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Globe } from "lucide-react";

const LanguageDetectionPopup = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState<string | null>(null);

  // Country to language mapping
  const countryToLanguage: Record<string, string> = {
    'NL': 'nl',
    'BE': 'nl', // Belgium (could also be fr)
    'DE': 'de',
    'AT': 'de', // Austria
    'CH': 'de', // Switzerland (could also be fr, it)
    'FR': 'fr',
    'ES': 'es',
    'IT': 'it',
    'HR': 'hr',
    'PT': 'pt',
    'PL': 'pl',
    'GB': 'en',
    'US': 'en',
    'CA': 'en',
    'AU': 'en',
    'NZ': 'en',
  };

  useEffect(() => {
    const checkLanguageMismatch = async () => {
      // Check if user has already dismissed the popup in this session
      const dismissed = sessionStorage.getItem('languagePopupDismissed');
      if (dismissed === 'true') return;

      try {
        // Get user's browser language
        const browserLang = navigator.language.split('-')[0]; // e.g., 'en' from 'en-US'
        
        // Get user's country from IP (using a free API)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const userCountry = data.country_code; // e.g., 'NL'

        // Determine suggested language based on country
        const countryBasedLang = countryToLanguage[userCountry];

        // Check if there's a mismatch
        if (countryBasedLang && lang && browserLang !== lang && countryBasedLang !== lang) {
          setSuggestedLang(countryBasedLang);
          setShowPopup(true);
        }
      } catch (error) {
        console.log('Could not detect user location for language suggestion');
      }
    };

    checkLanguageMismatch();
  }, [lang]);

  const handleSwitch = () => {
    if (suggestedLang) {
      i18n.changeLanguage(suggestedLang);
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/').filter(Boolean);
      const newPath = pathParts.length > 1 
        ? `/${suggestedLang}/${pathParts.slice(1).join('/')}`
        : `/${suggestedLang}`;
      navigate(newPath);
    }
    sessionStorage.setItem('languagePopupDismissed', 'true');
    setShowPopup(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('languagePopupDismissed', 'true');
    setShowPopup(false);
  };

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      nl: 'Nederlands',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español',
      it: 'Italiano',
      hr: 'Hrvatski',
      pt: 'Português',
      pl: 'Polski',
    };
    return names[code] || code;
  };

  return (
    <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Suggestion / Taalsuggestie
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>English:</strong> We detected you're browsing from a region where {suggestedLang && getLanguageName(suggestedLang)} is commonly spoken. Would you like to switch to {suggestedLang && getLanguageName(suggestedLang)}?
            </p>
            <p>
              <strong>Nederlands:</strong> We hebben gedetecteerd dat je browsed vanuit een regio waar {suggestedLang && getLanguageName(suggestedLang)} veelgesproken wordt. Wil je overschakelen naar {suggestedLang && getLanguageName(suggestedLang)}?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>
            No, keep current / Nee, behouden
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSwitch}>
            Yes, switch / Ja, overschakelen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LanguageDetectionPopup;
