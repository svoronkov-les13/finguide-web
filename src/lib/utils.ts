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

export function formatRub(value: number, options: FormatOptions = {}) {
  const { locale = "ru-RU", million = "млн ₽", thousand = "тыс. ₽", symbol = "₽" } = options;
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / 1_000_000).replace(/\u2212/g, '-')} ${million}`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value / 1_000).replace(/\u2212/g, '-')} ${thousand}`;
  }
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value).replace(/\u2212/g, '-')} ${symbol}`;
}

export function formatUsd(value: number, options: FormatOptions = {}) {
  const { locale = "ru-RU", million = "млн $", thousand = "тыс. $", symbol = "$" } = options;
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / 1_000_000).replace(/\u2212/g, '-')} ${million}`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value / 1_000).replace(/\u2212/g, '-')} ${thousand}`;
  }
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value).replace(/\u2212/g, '-')} ${symbol}`;
}

export function formatPercent(value: number, locale = "ru-RU") {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: "percent" }).format(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
