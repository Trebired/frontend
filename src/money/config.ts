import { frontendDataAttr } from "./../namespace/index.js";

type FrontendMoneyRound = "down" | "near" | "up";

type FrontendMoneyRuntimeConfig = {
  base: string;
  locales: Record<string, string>;
  rates: Record<string, number>;
  steps: Record<string, number>;
};

const MONEY_CONFIG_ATTR = frontendDataAttr("money-config");

const DEFAULT_MONEY_BASE = "CZK";

const DEFAULT_MONEY_LOCALES: Record<string, string> = {
  cs: "CZK",
  de: "EUR",
  en: "EUR",
  hu: "HUF",
  pl: "PLN",
  sk: "EUR",
  uk: "UAH",
};

const EMPTY: FrontendMoneyRuntimeConfig = {
  base: DEFAULT_MONEY_BASE,
  locales: DEFAULT_MONEY_LOCALES,
  rates: {},
  steps: {},
};

let configured: FrontendMoneyRuntimeConfig | null = null;

function numbersOf(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const amount = Number(entry);
    if (Number.isFinite(amount) && amount > 0) out[key.trim().toUpperCase()] = amount;
  }
  return out;
}

function localesOf(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return DEFAULT_MONEY_LOCALES;
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const code = String(entry || "").trim().toUpperCase();
    if (code) out[key.trim().toLowerCase()] = code;
  }
  return Object.keys(out).length ? out : DEFAULT_MONEY_LOCALES;
}

function normalize(value: unknown): FrontendMoneyRuntimeConfig {
  if (!value || typeof value !== "object") return EMPTY;
  const source = value as Record<string, unknown>;
  return {
    base: String(source.base || DEFAULT_MONEY_BASE).trim().toUpperCase(),
    locales: localesOf(source.locales),
    rates: numbersOf(source.rates),
    steps: numbersOf(source.steps),
  };
}

function configureFrontendMoney(value: unknown): FrontendMoneyRuntimeConfig {
  configured = normalize(value);
  return configured;
}

function readDocumentMoney(): FrontendMoneyRuntimeConfig | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.getAttribute(MONEY_CONFIG_ATTR);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

function getFrontendMoney(): FrontendMoneyRuntimeConfig {
  if (configured) return configured;
  const fromDocument = readDocumentMoney();
  if (fromDocument) configured = fromDocument;
  return configured || EMPTY;
}

export {
  configureFrontendMoney,
  DEFAULT_MONEY_BASE,
  DEFAULT_MONEY_LOCALES,
  getFrontendMoney,
  MONEY_CONFIG_ATTR,
};
export type { FrontendMoneyRound, FrontendMoneyRuntimeConfig };
