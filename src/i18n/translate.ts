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

const PLURAL_FORMS = ["one", "few", "many"] as const;
type PluralForm = (typeof PLURAL_FORMS)[number];
const pluralRules = new Map<Locale, Intl.PluralRules>();

/** Russian needs three forms (1 год, 2 года, 5 лет); English only uses "one" and "many". */
export function pluralForm(locale: Locale, count: number): PluralForm {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  const category = rules.select(Math.abs(count));
  return category === "one" || category === "few" ? category : "many";
}

function isPluralForms(value: unknown): value is Record<PluralForm, string> {
  return typeof value === "object" && value !== null
    && PLURAL_FORMS.every((form) => typeof (value as Record<string, unknown>)[form] === "string");
}

function lookup(locale: Locale, key: TranslationKey) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && Object.hasOwn(current, segment)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionaries[locale]);
}

/** A key holding { one, few, many } picks its form by `params.count`. */
export function translate(locale: Locale, key: TranslationKey, params: TranslationParams = {}) {
  const found = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
  const template = isPluralForms(found) ? found[pluralForm(locale, Number(params.count ?? 0))] : found;
  const values: TranslationParams = { ...params, brand: brand.name };
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values[name] ?? ""));
}

export function createTranslator(locale: Locale): Translate {
  return (key, params) => translate(locale, key, params);
}

/** For default names created outside React. UI labels should use useI18n(). */
export const translateCurrent: Translate = (key, params) => translate(readLocale(), key, params);
