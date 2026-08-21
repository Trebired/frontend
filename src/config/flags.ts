import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { invalidConfig } from "./shared.js";
import type {
  FrontendFlagsConfig,
  NormalizedFrontendFlagsConfig,
} from "./types/assets.js";

const COUNTRY_RE = /^[A-Z]{2}$/u;
const DEFAULT_FLAG_COUNTRIES = ["GB", "CZ"];
const DEFAULT_FLAG_RATIO = "3x2";

function normalizeCountry(value: unknown, index: number): string {
  const country = String(value || "").trim().toUpperCase();
  if (!COUNTRY_RE.test(country)) {
    throw invalidConfig(`assets.flags.countries.${index} must be a two-letter country code`);
  }
  return country;
}

function normalizeFlagsConfig(value: unknown): NormalizedFrontendFlagsConfig {
  if (value === false) return { countries: [], ratio: DEFAULT_FLAG_RATIO };
  if (value === undefined) {
    return { countries: [...DEFAULT_FLAG_COUNTRIES], ratio: DEFAULT_FLAG_RATIO };
  }
  const source: FrontendFlagsConfig = Array.isArray(value)
  ? { countries: value as readonly string[] }
  : (value as FrontendFlagsConfig);
  const ratio = source.ratio === "1x1" ? "1x1" : DEFAULT_FLAG_RATIO;
  const input = source.countries === undefined
  ? DEFAULT_FLAG_COUNTRIES
  : source.countries;
  if (!Array.isArray(input)) {
    throw invalidConfig("assets.flags.countries must be an array of country codes");
  }
  const countries: string[] = [];
  input.forEach((entry, index) => {
      const country = normalizeCountry(entry, index);
      if (!countries.includes(country)) countries.push(country);
  });
  return { countries: countries.sort(), ratio };
}

function flagSvgDirectory(ratio: string): string {
  const require = createRequire(import.meta.url);
  const entry = require.resolve("country-flag-icons/package.json");
  return path.join(path.dirname(entry), ratio);
}

function flagDataUri(country: string, ratio: string): string {
  const file = path.join(flagSvgDirectory(ratio), `${country}.svg`);
  const svg = fs.readFileSync(file, "utf8").trim();
  const encoded = svg
  .replace(/"/gu, "'")
  .replace(/%/gu, "%25")
  .replace(/#/gu, "%23")
  .replace(/</gu, "%3c")
  .replace(/>/gu, "%3e")
  .replace(/\s+/gu, " ");
  return `data:image/svg+xml,${encoded}`;
}

function renderFlagRules(config: NormalizedFrontendFlagsConfig): string[] {
  if (!config.countries.length) return [];
  const widthRatio = config.ratio === "1x1" ? "1" : "3/2";
  const lines: string[] = [
    `[class*=" flag:"], [class^="flag:"] {`,
    "  display: inline-block;",
    "  background-size: cover;",
    "  --CountryFlagIcon-height: 1em;",
    "  height: var(--CountryFlagIcon-height);",
    `  width: calc(var(--CountryFlagIcon-height) * ${widthRatio});`,
    "}",
  ];
  for (const country of config.countries) {
    let uri = "";
    try {
      uri = flagDataUri(country, config.ratio);
    } catch {
      continue;
    }
    lines.push(`.flag\\:${country} { background-image: url("${uri}"); }`);
  }
  return lines;
}

export { DEFAULT_FLAG_COUNTRIES, normalizeFlagsConfig, renderFlagRules };
