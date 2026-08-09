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

/** Formats with an apostrophe as the group separator (1'498'432), keeping the locale decimal separator. */
export function formatNumber(value: number, locale = "ru-RU", maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits })
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

export function formatPercent(value: number, locale = "ru-RU") {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: "percent" }).format(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
