import { useI18n } from "@/i18n/I18nProvider";
import { formatRub, formatUsd, formatPercent } from "@/lib/utils";

type SimpleFormatOptions = { compact?: boolean; sign?: boolean };

/**
 * Hook that returns localized versions of formatRub/formatUsd/formatPercent.
 * Automatically injects i18n suffixes — callers use the same API as before.
 */
export function useFormat() {
  const { t, locale } = useI18n();
  const loc = locale === "en" ? "en-US" : "ru-RU";

  const fmtRub = (value: number, options: SimpleFormatOptions = {}) =>
    formatRub(value, {
      ...options,
      locale: loc,
      million: t("format.millionRub"),
      thousand: t("format.thousandRub"),
      symbol: t("format.symbolRub"),
    });

  const fmtUsd = (value: number, options: SimpleFormatOptions = {}) =>
    formatUsd(value, {
      ...options,
      locale: loc,
      million: t("format.millionUsd"),
      thousand: t("format.thousandUsd"),
      symbol: t("format.symbolUsd"),
    });

  const fmtPercent = (value: number) => formatPercent(value, loc);

  return { formatRub: fmtRub, formatUsd: fmtUsd, formatPercent: fmtPercent };
}
