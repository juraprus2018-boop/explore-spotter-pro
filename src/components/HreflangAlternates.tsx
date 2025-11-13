import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

interface HreflangAlternatesProps {
  languages?: string[];
  baseUrl?: string;
}

const HreflangAlternates = ({ 
  languages = ["nl", "en", "de", "fr", "es", "it", "hr", "pt", "pl"],
  baseUrl = "https://restaurantfinder.com" // Replace with actual domain
}: HreflangAlternatesProps) => {
  const location = useLocation();
  
  // Extract the path without language prefix
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentLang = pathParts[0];
  const pathWithoutLang = pathParts.length > 1 ? '/' + pathParts.slice(1).join('/') : '';

  return (
    <Helmet>
      {/* x-default for international users */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en${pathWithoutLang}`}
      />
      
      {/* Language alternates */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}/${lang}${pathWithoutLang}`}
        />
      ))}

      {/* Canonical URL for current language */}
      <link
        rel="canonical"
        href={`${baseUrl}/${currentLang}${pathWithoutLang}`}
      />
    </Helmet>
  );
};

export default HreflangAlternates;
