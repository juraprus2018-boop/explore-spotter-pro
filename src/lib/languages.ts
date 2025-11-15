import supportedLanguages from "../../config/supported-languages.json";

export type SupportedLanguage =
  | "nl"
  | "en"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "pt"
  | "pl"
  | "hr"
  | "ru"
  | "ja"
  | "zh"
  | "ar"
  | "tr"
  | "sv"
  | "da"
  | "no"
  | "fi"
  | "cs"
  | "ro";

export const SUPPORTED_LANGUAGES = supportedLanguages as readonly SupportedLanguage[];

export const DEFAULT_LANGUAGE: SupportedLanguage =
  (SUPPORTED_LANGUAGES[0] as SupportedLanguage | undefined) ?? "nl";

export const PRIMARY_LANGUAGES: SupportedLanguage[] = ["nl", "en", "de", "fr"];

export const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
