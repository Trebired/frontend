import { fetchMoneyRates } from "./../../money/rates.js";
import type { BuildDataResult, BuildDataSource } from "./types.js";

type MoneyRatesSourceOptions = {
  base: string;
  currencies: string[];
  timeout?: number;
  url?: string;
};

type MoneyRatesValue = {
  base: string;
  date: string;
  fetchedAt: string;
  rates: Record<string, number>;
  source: string;
};

const DEFAULT_TIMEOUT = 15000;

async function readRates(options: MoneyRatesSourceOptions): Promise<BuildDataResult<MoneyRatesValue>> {
  const live = await fetchMoneyRates({
      base: options.base,
      currencies: options.currencies,
      signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT),
      ...(options.url ? { url: options.url } : {}),
  });
  const quoted = options.currencies
  .map((code) => `${code} ${live.rates[code.trim().toUpperCase()]?.toFixed(5) || "?"}`)
  .join(", ");
  return {
    detail: `${live.date} :: 1 ${live.base} = ${quoted}`,
    value: { ...live, fetchedAt: new Date().toISOString() },
  };
}

function moneyRatesSource(options: MoneyRatesSourceOptions): BuildDataSource<MoneyRatesValue> {
  return { fetch: () => readRates(options) };
}

export { moneyRatesSource };
export type { MoneyRatesSourceOptions, MoneyRatesValue };
