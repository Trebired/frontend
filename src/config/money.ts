import { DEFAULT_MONEY_BASE, DEFAULT_MONEY_LOCALES } from "./../money/config.js";
import { assertPlainObject, invalidConfig } from "./shared.js";

import type { NormalizedFrontendMoneyConfig } from "./types.js";

const MONEY_FIELDS = ["base", "locales", "rates", "steps"];

const EMPTY_MONEY_CONFIG: NormalizedFrontendMoneyConfig = Object.freeze({
    base: DEFAULT_MONEY_BASE,
    locales: Object.freeze({ ...DEFAULT_MONEY_LOCALES }) as Record<string, string>,
    rates: Object.freeze({}) as Record<string, number>,
    steps: Object.freeze({}) as Record<string, number>,
});

function currencyCode(value: unknown, pathLabel: string): string {
  const code = String(value || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/u.test(code)) throw invalidConfig(`${pathLabel} must be a three letter currency code`);
  return code;
}

function normalizeLocales(value: unknown): Record<string, string> {
  if (value === undefined) return { ...DEFAULT_MONEY_LOCALES };
  const source = assertPlainObject(value, "config.money.locales");
  const out: Record<string, string> = {};
  for (const [lang, code] of Object.entries(source)) {
    out[lang.trim().toLowerCase()] = currencyCode(code, `config.money.locales.${lang}`);
  }
  return out;
}

function normalizeAmounts(value: unknown, field: string): Record<string, number> {
  if (value === undefined) return {};
  const source = assertPlainObject(value, `config.money.${field}`);
  const out: Record<string, number> = {};
  for (const [code, amount] of Object.entries(source)) {
    const next = Number(amount);
    if (!Number.isFinite(next) || next <= 0) {
      throw invalidConfig(`config.money.${field}.${code} must be a positive number`);
    }
    out[currencyCode(code, `config.money.${field}.${code}`)] = next;
  }
  return out;
}

function normalizeMoneyConfig(value: unknown): NormalizedFrontendMoneyConfig {
  if (value === undefined) return EMPTY_MONEY_CONFIG;
  const source = assertPlainObject(value, "config.money");
  for (const key of Object.keys(source)) {
    if (!MONEY_FIELDS.includes(key)) throw invalidConfig(`config.money.${key} is not supported`);
  }
  return {
    base: source.base === undefined ? DEFAULT_MONEY_BASE : currencyCode(source.base, "config.money.base"),
    locales: normalizeLocales(source.locales),
    rates: normalizeAmounts(source.rates, "rates"),
    steps: normalizeAmounts(source.steps, "steps"),
  };
}

export { EMPTY_MONEY_CONFIG, normalizeMoneyConfig };
