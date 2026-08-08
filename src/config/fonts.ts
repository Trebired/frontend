import { assertPlainObject, cssString, invalidConfig } from "./shared.js";
import type {
  NormalizedTrebiredFrontendFontConfig,
  NormalizedTrebiredFrontendFontFamilyConfig,
  TrebiredFrontendFontDisplay,
  TrebiredFrontendFontStyle,
} from "./types.js";

const DEFAULT_FONT_DISPLAY: TrebiredFrontendFontDisplay = "swap";
const DEFAULT_FONT_STYLES: TrebiredFrontendFontStyle[] = ["normal"];
const DEFAULT_FONT_SUBSETS = ["latin"];
const DEFAULT_FONT_WEIGHTS = [400];
const SUPPORTED_FONT_DISPLAYS = new Set(["auto", "block", "fallback", "optional", "swap"]);
const SUPPORTED_FONT_STYLES = new Set(["italic", "normal"]);

function normalizeFontsConfig(value: unknown): NormalizedTrebiredFrontendFontConfig {
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

function normalizeFontFamily(key: string, value: unknown): NormalizedTrebiredFrontendFontFamilyConfig {
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

function normalizeFontDisplay(value: unknown, pathLabel: string): TrebiredFrontendFontDisplay {
  if (value === undefined) return DEFAULT_FONT_DISPLAY;
  const display = String(value || "").trim().toLowerCase();
  if (!SUPPORTED_FONT_DISPLAYS.has(display)) {
    throw invalidConfig(`${pathLabel} must be one of auto, block, fallback, optional, or swap`);
  }
  return display as TrebiredFrontendFontDisplay;
}

function normalizeFontStyles(value: unknown, pathLabel: string): TrebiredFrontendFontStyle[] {
  return normalizeStringArray(value, DEFAULT_FONT_STYLES, pathLabel, (item, itemPath) => {
    const style = String(item || "").trim().toLowerCase();
    if (!SUPPORTED_FONT_STYLES.has(style)) throw invalidConfig(`${itemPath} must be normal or italic`);
    return style as TrebiredFrontendFontStyle;
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

function defaultSansFontStack(families: NormalizedTrebiredFrontendFontFamilyConfig[]): string {
  const sans = families.find((family) => family.key === "sans");
  return sans ? `${cssString(sans.family)}, sans-serif` : "";
}

function renderFontsCss(config: NormalizedTrebiredFrontendFontConfig): string[] {
  const lines = config.families.flatMap((family) => fontFaceBlocks(family));
  const root = fontRootDeclarations(config);
  if (root.length) lines.push("", ":root {", ...root, "}");
  return lines;
}

function fontFaceBlocks(family: NormalizedTrebiredFrontendFontFamilyConfig): string[] {
  return family.subsets.flatMap((subset) =>
    family.weights.flatMap((weight) =>
      family.styles.flatMap((style) => [
        "@font-face {",
        `  font-family: ${cssString(family.family)};`,
        `  font-style: ${style};`,
        `  font-display: ${family.display};`,
        `  font-weight: ${weight};`,
        `  src: url(${cssString(fontsourceFileUrl(family.packageName, subset, weight, style))}) format("woff2");`,
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
  style: TrebiredFrontendFontStyle,
): string {
  return `@fontsource/${packageName}/files/${packageName}-${subset}-${weight}-${style}.woff2`;
}

function fontRootDeclarations(config: NormalizedTrebiredFrontendFontConfig): string[] {
  const lines: string[] = [];
  if (config.sans) lines.push(`  --tbf-font-sans: ${config.sans};`);
  for (const family of config.families) {
    lines.push(`  --tbf-font-family-${family.key}: ${cssString(family.family)};`);
  }
  return lines;
}

export { normalizeFontsConfig, renderFontsCss };
