import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { dictionaries, locales, type Locale, type TranslationKey } from "@/i18n/messages";

type Params = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Params) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "finguide.locale";
const DEFAULT_LOCALE: Locale = "ru";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

function initialLocale(): Locale {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    return DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
}

function lookup(locale: Locale, key: TranslationKey) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionaries[locale]);
}

function interpolate(template: string, params: Params = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(params[key] ?? ""));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // The UI still works without persistence.
    }
  }, [locale]);

  const setLocale = (nextLocale: Locale) => setLocaleState(nextLocale);
  const t = (key: TranslationKey, params?: Params) => {
    const value = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
    return interpolate(String(value), params);
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
