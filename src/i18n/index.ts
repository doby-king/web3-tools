/**
 * Global i18n setup (i18next + react-i18next + browser language detection).
 *
 * - Translation files: src/i18n/locales/<lang>.json; en.json is the single source
 *   of truth for the key structure (compile-time type checking via the module
 *   augmentation in i18next.d.ts)
 * - Default / fallback language: en; the chosen language is cached in localStorage
 *   (key: web3-tools-language)
 * - Imported in main.tsx as a side effect via `import '@/i18n'` so initialization
 *   completes before React renders
 */
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import lzh from "./locales/lzh.json";
import zh from "./locales/zh.json";

/** Supported languages (labels always use each language's native name, never translated) */
export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "lzh", label: "文言文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];

const LANGUAGE_STORAGE_KEY = "web3-tools-language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      lzh: { translation: lzh },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    fallbackLng: "en",
    supportedLngs: supportedLanguages.map((l) => l.code),
    // Automatically normalize regional variants like zh-CN / ja-JP to their base language code
    nonExplicitSupportedLngs: true,
    interpolation: {
      // React already escapes by default, so i18next doesn't need to escape again
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
  });

// Sync <html lang> on language change for correct accessibility and browser translation behavior
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
