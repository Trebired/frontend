import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { assertPlainObject, cssString, invalidConfig } from "./shared.js";
import { frontendCssVar } from "#5vbaqj4pirp3";
import type {
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
  FrontendFontDisplay,
  FrontendFontStyle,
} from "./types.js";

const DEFAULT_FONT_DISPLAY: FrontendFontDisplay = "swap";
const DEFAULT_FONT_STYLES: FrontendFontStyle[] = ["normal"];
const DEFAULT_FONT_SUBSETS = ["latin"];
const DEFAULT_FONT_WEIGHTS = [400];
const SUPPORTED_FONT_DISPLAYS = new Set(["auto", "block", "fallback", "optional", "swap"]);
const SUPPORTED_FONT_STYLES = new Set(["italic", "normal"]);

function normalizeFontsConfig(value: unknown): NormalizedFrontendFontConfig {
  if (value === undefined) return { families: [], sans: "" };
  const source = assertPlainObject(value, "fonts");
  const familiesSource = source.families === undefined ? {} : assertPlainObject(source.families, "fonts.families");
  const families = Object.entries(familiesSource)
  .map(([key, raw]) => normalizeFontFamily(key, raw))
  .sort((a, b) => a.key.localeCompare(b.key));
  return {
    families,
    sans: normalizeFontStack(source.sans, "fonts.sans") || defaultSansFontStack(families),
  };
}

function normalizeFontFamily(key: string, value: unknown): NormalizedFrontendFontFamilyConfig {
  const source = assertPlainObject(value, `fonts.families.${key}`);
  const packageName = normalizeFontsourcePackage(source.package || source.fontsource || key, `fonts.families.${key}.package`);
  return {
    display: normalizeFontDisplay(source.display, `fonts.families.${key}.display`),
    family: normalizeFontFamilyName(source.family || fontFamilyFromPackage(packageName), `fonts.families.${key}.family`),
    key: normalizeFontKey(key),
    packageName,
    styles: normalizeFontStyles(source.styles, `fonts.families.${key}.styles`),
    subsets: normalizeStringArray(source.subsets, DEFAULT_FONT_SUBSETS, `fonts.families.${key}.subsets`, normalizeFontSubset),
    weights: normalizeFontWeights(source.weights, `fonts.families.${key}.weights`),
  };
}

function normalizeFontKey(value: unknown): string {
  const key = String(value || "").trim();
  if (!/^[a-z][a-z0-9_-]*$/iu.test(key)) {
    throw invalidConfig(`font key ${String(value)} must start with a letter and contain only letters, numbers, underscores, or hyphens`);
  }
  return key;
}

function normalizeFontsourcePackage(value: unknown, pathLabel: string): string {
  let text = String(value || "").trim().toLowerCase();
  if (text.startsWith("@fontsource/")) text = text.slice("@fontsource/".length);
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(text)) {
    throw invalidConfig(`${pathLabel} must be a Fontsource package name such as "inter"`);
  }
  return text;
}

function normalizeFontFamilyName(value: unknown, pathLabel: string): string {
  const family = String(value || "").trim();
  if (!family || /["\\\n\r]/u.test(family)) {
    throw invalidConfig(`${pathLabel} must be a CSS font family name without quotes or newlines`);
  }
  return family;
}

function normalizeFontDisplay(value: unknown, pathLabel: string): FrontendFontDisplay {
  if (value === undefined) return DEFAULT_FONT_DISPLAY;
  const display = String(value || "").trim().toLowerCase();
  if (!SUPPORTED_FONT_DISPLAYS.has(display)) {
    throw invalidConfig(`${pathLabel} must be one of auto, block, fallback, optional, or swap`);
  }
  return display as FrontendFontDisplay;
}

function normalizeFontStyles(value: unknown, pathLabel: string): FrontendFontStyle[] {
  return normalizeStringArray(value, DEFAULT_FONT_STYLES, pathLabel, (item, itemPath) => {
      const style = String(item || "").trim().toLowerCase();
      if (!SUPPORTED_FONT_STYLES.has(style)) throw invalidConfig(`${itemPath} must be normal or italic`);
      return style as FrontendFontStyle;
  });
}

function normalizeFontWeights(value: unknown, pathLabel: string): number[] {
  const raw = value === undefined ? DEFAULT_FONT_WEIGHTS : value;
  if (!Array.isArray(raw)) throw invalidConfig(`${pathLabel} must be an array`);
  const weights: number[] = [];
  for (const item of raw) {
    const weight = typeof item === "number" ? item : Number(String(item || "").trim());
    if (!Number.isInteger(weight) || weight < 1 || weight > 1000) {
      throw invalidConfig(`${pathLabel} entries must be integer CSS font weights`);
    }
    if (!weights.includes(weight)) weights.push(weight);
  }
  return weights.sort((a, b) => a - b);
}

function normalizeStringArray<T extends string>(
  value: unknown,
  fallback: readonly string[],
  pathLabel: string,
  normalize: (value: unknown, pathLabel: string) => T,
): T[] {
  const raw = value === undefined ? fallback : value;
  if (!Array.isArray(raw)) throw invalidConfig(`${pathLabel} must be an array`);
  const out: T[] = [];
  raw.forEach((item, index) => {
      const normalized = normalize(item, `${pathLabel}.${index}`);
      if (!out.includes(normalized)) out.push(normalized);
  });
  return out;
}

function normalizeFontSubset(value: unknown, pathLabel: string): string {
  const subset = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(subset)) {
    throw invalidConfig(`${pathLabel} must be a Fontsource subset name such as "latin" or "latin-ext"`);
  }
  return subset;
}

function normalizeFontStack(value: unknown, pathLabel: string): string {
  if (value === undefined) return "";
  const stack = String(value || "").trim();
  if (/[\n\r]/u.test(stack)) throw invalidConfig(`${pathLabel} must be a single-line CSS font stack`);
  return stack;
}

function fontFamilyFromPackage(packageName: string): string {
  return packageName.split("-")
  .filter(Boolean)
  .map((part) => `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
  .join(" ");
}

function defaultSansFontStack(families: NormalizedFrontendFontFamilyConfig[]): string {
  const sans = families.find((family) => family.key === "sans");
  return sans ? `${cssString(sans.family)}, sans-serif` : "";
}

function renderFontsCss(config: NormalizedFrontendFontConfig): string[] {
  const lines = config.families.flatMap((family) => fontFaceBlocks(family));
  const root = fontRootDeclarations(config);
  if (root.length) lines.push("", ":root {", ...root, "}");
  return lines;
}

const unicodeRangeCache = new Map<string, Record<string, string>>();

/**
 * Fontsource packages are a dependency of the consuming app, not of this
 * package, so resolve from the project root first and only then from here.
 */
function resolveFontsourceUnicodeFile(packageName: string): string | null {
  const specifier = `@fontsource/${packageName}/package.json`;
  const bases = [
    path.join(process.cwd(), "package.json"),
    import.meta.url,
  ];
  for (const base of bases) {
    try {
      const entry = createRequire(base).resolve(specifier);
      const file = path.join(path.dirname(entry), "unicode.json");
      if (fs.existsSync(file)) return file;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Fontsource ships the per-subset unicode ranges in `unicode.json`. Without a
 * `unicode-range`, two subset faces of the same family differ only by `src`,
 * so the browser treats them as the same face and the last one wins — the
 * other subset's file is never used and its glyphs fall back to a system font.
 */
function fontsourceUnicodeRanges(packageName: string): Record<string, string> {
  const cached = unicodeRangeCache.get(packageName);
  if (cached) return cached;
  let ranges: Record<string, string> = {};
  try {
    const file = resolveFontsourceUnicodeFile(packageName);
    if (!file) {
      unicodeRangeCache.set(packageName, {});
      return {};
    }
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (parsed && typeof parsed === "object") {
      ranges = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
        .filter(([, value]) => typeof value === "string" && value.trim())
        .map(([key, value]) => [key, String(value).trim()]),
      );
    }
  } catch {
    ranges = {};
  }
  unicodeRangeCache.set(packageName, ranges);
  return ranges;
}

function fontFaceBlocks(family: NormalizedFrontendFontFamilyConfig): string[] {
  const ranges = fontsourceUnicodeRanges(family.packageName);
  return family.subsets.flatMap((subset) =>
    family.weights.flatMap((weight) =>
      family.styles.flatMap((style) => [
          "@font-face {",
          `  font-family: ${cssString(family.family)};`,
          `  font-style: ${style};`,
          `  font-display: ${family.display};`,
          `  font-weight: ${weight};`,
          `  src: url(${cssString(fontsourceFileUrl(family.packageName, subset, weight, style))}) format("woff2");`,
          ...(ranges[subset] ? [`  unicode-range: ${ranges[subset]};`] : []),
          "}",
          "",
      ]),
    ),
  ).slice(0, -1);
}

function fontsourceFileUrl(
  packageName: string,
  subset: string,
  weight: number,
  style: FrontendFontStyle,
): string {
  return `@fontsource/${packageName}/files/${packageName}-${subset}-${weight}-${style}.woff2`;
}

function fontRootDeclarations(config: NormalizedFrontendFontConfig): string[] {
  const lines: string[] = [];
  if (config.sans) lines.push(`  ${frontendCssVar("font-sans")}: ${config.sans};`);
  for (const family of config.families) {
    lines.push(`  ${frontendCssVar(`font-family-${family.key}`)}: ${cssString(family.family)};`);
  }
  return lines;
}

export { normalizeFontsConfig, renderFontsCss };
