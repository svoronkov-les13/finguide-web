import { dictionaries, locales, type Locale, type TranslationKey } from "./messages";
import { brand } from "../config/brand";

export type TranslationParams = Record<string, string | number>;
export type Translate = (key: TranslationKey, params?: TranslationParams) => string;
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_STORAGE_KEY = "finguide.locale";

export function readLocale(): Locale {
  try {
    const stored = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    if (locales.includes(stored as Locale)) return stored as Locale;
  } catch { /* Storage is optional. */ }
  return DEFAULT_LOCALE;
}

function lookup(locale: Locale, key: TranslationKey) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && Object.hasOwn(current, segment)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionaries[locale]);
}

export function translate(locale: Locale, key: TranslationKey, params: TranslationParams = {}) {
  const template = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
  const values: TranslationParams = { ...params, brand: brand.name };
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values[name] ?? ""));
}

export function createTranslator(locale: Locale): Translate {
  return (key, params) => translate(locale, key, params);
}

/** For default names created outside React. UI labels should use useI18n(). */
export const translateCurrent: Translate = (key, params) => translate(readLocale(), key, params);
