import { SupportedLanguage } from "./languages";

// Mapping from language codes to country codes (ISO 3166-1 alpha-2)
export const LANGUAGE_TO_COUNTRY_MAP: Record<SupportedLanguage, string> = {
  nl: "NL", // Netherlands
  en: "GB", // United Kingdom
  de: "DE", // Germany
  fr: "FR", // France
  es: "ES", // Spain
  it: "IT", // Italy
  pt: "PT", // Portugal
  pl: "PL", // Poland
  hr: "HR", // Croatia
  ja: "JP", // Japan
  zh: "CN", // China
  ar: "SA", // Saudi Arabia (representative for Arabic)
  tr: "TR", // Turkey
  sv: "SE", // Sweden
  da: "DK", // Denmark
  no: "NO", // Norway
  fi: "FI", // Finland
  cs: "CZ", // Czech Republic
  ro: "RO", // Romania
};

export const getCountryCodeFromLanguage = (lang: string): string => {
  return LANGUAGE_TO_COUNTRY_MAP[lang as SupportedLanguage] || "NL";
};
