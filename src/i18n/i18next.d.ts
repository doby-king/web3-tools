/**
 * i18next type augmentation: uses the structure of en.json as the single source
 * of truth for all keys.
 *
 * Effects:
 * 1. Keys passed to t('xxx') are checked at compile time; typos / undefined keys
 *    produce a TS error immediately;
 * 2. IDEs can autocomplete keys, and plugins like i18n Ally can jump straight
 *    from t('key') to the matching entry in locales/*.json (jumping relies on the
 *    editor plugin; type checking is the safety net).
 *
 * Note: new locale files must keep a key structure identical to en.json.
 */
import type en from "./locales/en.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}
