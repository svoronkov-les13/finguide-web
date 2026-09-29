import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { type Locale } from "@/i18n/messages";
import { LOCALE_STORAGE_KEY, readLocale, translate, type Translate } from "./translate";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  const t = useCallback<Translate>((key, params) => translate(locale, key, params), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("app.documentTitle");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("app.description"));
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // The UI still works without persistence.
    }
  }, [locale, t]);

  const setLocale = (nextLocale: Locale) => setLocaleState(nextLocale);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
