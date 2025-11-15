import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
} from "@/lib/languages";

interface HreflangAlternatesProps {
  languages?: string[];
  baseUrl?: string;
}

const HreflangAlternates = ({
  languages = [...SUPPORTED_LANGUAGES],
  baseUrl,
}: HreflangAlternatesProps) => {
  const location = useLocation();

  // Extract the path without language prefix
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentLang = pathParts[0];
  const pathWithoutLang = pathParts.length > 1 ? '/' + pathParts.slice(1).join('/') : '';

  const resolvedBaseUrl =
    baseUrl ||
    (typeof window !== 'undefined' && window.location.origin) ||
    'https://eatnavigator.com';

  const canonicalLanguage =
    currentLang && isSupportedLanguage(currentLang)
      ? currentLang
      : DEFAULT_LANGUAGE;

  return (
    <Helmet>
      {/* x-default for international users */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${resolvedBaseUrl}/${DEFAULT_LANGUAGE}${pathWithoutLang}`}
      />

      {/* Language alternates */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${resolvedBaseUrl}/${lang}${pathWithoutLang}`}
        />
      ))}

      {/* Canonical URL for current language */}
      <link
        rel="canonical"
        href={`${resolvedBaseUrl}/${canonicalLanguage}${pathWithoutLang}`}
      />
    </Helmet>
  );
};

export default HreflangAlternates;
