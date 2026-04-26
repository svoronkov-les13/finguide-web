import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRub(value: number, options: { compact?: boolean; sign?: boolean } = {}) {
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1_000_000)} млн ₽`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value / 1_000)} тыс. ₽`;
  }
  return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
}

export function formatUsd(value: number, options: { compact?: boolean; sign?: boolean } = {}) {
  const sign = options.sign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) {
    return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1_000_000)} млн $`;
  }
  if (options.compact && abs >= 1_000) {
    return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value / 1_000)} тыс. $`;
  }
  return `${sign}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} $`;
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1, style: "percent" }).format(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
