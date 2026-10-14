const ECB_DAILY_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

type MoneyRatesResult = {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
};

type MoneyRatesOptions = {
  base?: string;
  currencies: string[];
  signal?: AbortSignal;
  url?: string;
};

function parseEuroRates(xml: string): Record<string, number> {
  const rates: Record<string, number> = { EUR: 1 };
  const pattern = /currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/gu;
  for (const match of xml.matchAll(pattern)) {
    const amount = Number(match[2]);
    if (Number.isFinite(amount) && amount > 0) rates[match[1] as string] = amount;
  }
  return rates;
}

function parseRatesDate(xml: string): string {
  const match = /time=['"](\d{4}-\d{2}-\d{2})['"]/u.exec(xml);
  return match ? (match[1] as string) : "";
}

function ratesAgainst(base: string, euro: Record<string, number>, currencies: string[]) {
  const baseRate = euro[base];
  if (!baseRate) throw new Error(`the reference feed does not quote ${base}`);
  const rates: Record<string, number> = {};
  for (const currency of currencies) {
    const code = currency.trim().toUpperCase();
    if (code === base) continue;
    const quoted = euro[code];
    if (!quoted) throw new Error(`the reference feed does not quote ${code}`);
    rates[code] = quoted / baseRate;
  }
  return rates;
}

async function fetchMoneyRates(options: MoneyRatesOptions): Promise<MoneyRatesResult> {
  const base = String(options.base || "CZK").trim().toUpperCase();
  const url = options.url || ECB_DAILY_URL;
  const response = await fetch(url, options.signal ? { signal: options.signal } : {});
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  const xml = await response.text();
  const euro = parseEuroRates(xml);
  return {
    base,
    date: parseRatesDate(xml),
    rates: ratesAgainst(base, euro, options.currencies),
    source: url,
  };
}

export { ECB_DAILY_URL, fetchMoneyRates };
export type { MoneyRatesOptions, MoneyRatesResult };
