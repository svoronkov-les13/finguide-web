import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormatOptions {
  compact?: boolean;
  sign?: boolean;
  locale?: string;
  million?: string;
  thousand?: string;
  symbol?: string;
}

const numberFormatCache = new Map<string, Intl.NumberFormat>();

function cachedNumberFormat(locale: string, maximumFractionDigits: number) {
  const key = `${locale}:${maximumFractionDigits}`;
  let format = numberFormatCache.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits });
    numberFormatCache.set(key, format);
  }
  return format;
}

/** Formats with an apostrophe as the group separator (1'498'432), keeping the locale decimal separator. */
export function formatNumber(value: number, locale = "ru-RU", maximumFractionDigits = 0) {
  return cachedNumberFormat(locale, maximumFractionDigits)
    .formatToParts(value)
    .map((part) => (part.type === "group" ? "'" : part.value))
    .join("")
    .replace(/\u2212/g, '-');
}

export function formatRub(value: number, options: FormatOptions = {}) {
  const { locale = "ru-RU", million = "млн ₽", thousand = "тыс. ₽", symbol = "₽" } = options;
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${formatNumber(value / 1_000_000, locale, 1)} ${million}`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${formatNumber(value / 1_000, locale)} ${thousand}`;
  }
  return `${sign}${formatNumber(value, locale)} ${symbol}`;
}

export function formatUsd(value: number, options: FormatOptions = {}) {
  const { locale = "ru-RU", million = "млн $", thousand = "тыс. $", symbol = "$" } = options;
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${formatNumber(value / 1_000_000, locale, 1)} ${million}`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${formatNumber(value / 1_000, locale)} ${thousand}`;
  }
  return `${sign}${formatNumber(value, locale)} ${symbol}`;
}

const percentFormatCache = new Map<string, Intl.NumberFormat>();

export function formatPercent(value: number, locale = "ru-RU") {
  let format = percentFormatCache.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: "percent" });
    percentFormatCache.set(locale, format);
  }
  return format.format(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
