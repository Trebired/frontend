import fs from "node:fs";
import path from "node:path";

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
  rates: Record<string, number>;
  source: string;
};

type ReadMoneyRatesOptions = {
  dir?: string;
  name?: string;
  rootDir?: string;
};

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_DATA_DIR = "dist/data";
const DEFAULT_SOURCE_NAME = "rates";

function readMoneyRates(options: ReadMoneyRatesOptions = {}): Record<string, number> {
  const file = path.join(
    options.rootDir || process.cwd(),
    options.dir || DEFAULT_DATA_DIR,
    `${options.name || DEFAULT_SOURCE_NAME}.json`,
  );
  if (!fs.existsSync(file)) return {};
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<MoneyRatesValue>;
  return parsed.rates || {};
}

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
    value: live,
  };
}

function moneyRatesSource(options: MoneyRatesSourceOptions): BuildDataSource<MoneyRatesValue> {
  return { fetch: () => readRates(options) };
}

export { moneyRatesSource, readMoneyRates };
export type { MoneyRatesSourceOptions, MoneyRatesValue, ReadMoneyRatesOptions };
