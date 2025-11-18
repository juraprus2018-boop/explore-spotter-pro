export const SUPPORTED_LANGUAGES = [
  "nl",
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "pl",
  "hr",
  "ja",
  "zh",
  "ar",
  "tr",
  "sv",
  "da",
  "no",
  "fi",
  "cs",
  "ro",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "nl";

export const PRIMARY_LANGUAGES: SupportedLanguage[] = ["nl", "en", "de", "fr"];

export const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
