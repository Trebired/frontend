import { getFrontendMoney, type FrontendMoneyRound } from "./config.js";

type MoneyOptions = {
  currency?: string;
  round?: FrontendMoneyRound;
  step?: number;
};

function moneyCurrencyFor(lang: string): string {
  const config = getFrontendMoney();
  const code = config.locales[String(lang || "").trim().toLowerCase()];
  return code || config.base;
}

function moneyRateFor(currency: string): number {
  const config = getFrontendMoney();
  if (currency === config.base) return 1;
  return config.rates[currency] || 0;
}

function defaultStep(amount: number): number {
  const size = Math.abs(amount);
  if (size < 20) return 1;
  const digits = Math.floor(Math.log10(size)) + 1;
  return 10 ** Math.max(0, digits - 2);
}

function stepFor(currency: string, amount: number, options: MoneyOptions): number {
  if (options.step && options.step > 0) return options.step;
  const configured = getFrontendMoney().steps[currency];
  if (configured && configured > 0) return configured;
  return defaultStep(amount);
}

function roundTo(amount: number, step: number, round: FrontendMoneyRound): number {
  const scaled = amount / step;
  if (round === "down") return Math.floor(scaled) * step;
  if (round === "up") return Math.ceil(scaled) * step;
  return Math.round(scaled) * step;
}

function convertMoney(amount: number, lang: string, options: MoneyOptions = {}): number {
  const currency = options.currency || moneyCurrencyFor(lang);
  const rate = moneyRateFor(currency);
  if (!rate) return amount;
  if (rate === 1) return amount;
  const converted = amount * rate;
  return roundTo(converted, stepFor(currency, converted, options), options.round || "near");
}

function moneyCurrencyOf(lang: string, options: MoneyOptions): string {
  const wanted = options.currency || moneyCurrencyFor(lang);
  return moneyRateFor(wanted) ? wanted : getFrontendMoney().base;
}

function formatMoney(amount: number, lang: string, options: MoneyOptions = {}): string {
  const currency = moneyCurrencyOf(lang, options);
  const value = convertMoney(amount, lang, { ...options, currency });
  const locale = String(lang || "").trim() || undefined;
  try {
    return new Intl.NumberFormat(locale, {
        currency,
        maximumFractionDigits: 0,
        style: "currency",
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale)} ${currency}`;
  }
}

export { convertMoney, formatMoney, moneyCurrencyFor };
export type { MoneyOptions };
