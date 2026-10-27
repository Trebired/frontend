import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";

import { FRONTEND_PREFIX, frontendCssVar } from "./../namespace/index.js";
import { GLYPH_FIRST, GLYPH_LAST, GLYPH_OTHER, glyphVar } from "./../heading/glyphs.js";
import { assertPlainObject, invalidConfig } from "./shared.js";
import type { NormalizedFrontendFontConfig, NormalizedFrontendFontFamilyConfig } from "./types.js";

type FrontendTitlesConfig = {
  fit?: false | {
    below?: string;
    font?: string;
    weight?: number;
  };
};

type NormalizedFrontendTitlesConfig = {
  fit: null | {
    below: string;
    glyphs: Record<string, number>;
  };
};

type TitleSource = {
  breakpoints: Record<string, number>;
  fonts: NormalizedFrontendFontConfig;
  heading: Record<string, unknown>;
};

type Tables = Map<string, Buffer>;

const FIT_FIELDS = ["below", "font", "weight"];

const LOWER_A = 97;

const LOWER_Z = 122;

function resolvePackageFile(packageName: string, file: string): string {
  const bases = [path.join(process.cwd(), "package.json"), import.meta.url];
  for (const base of bases) {
    try {
      const entry = createRequire(base).resolve(`@fontsource/${packageName}/package.json`);
      const resolved = path.join(path.dirname(entry), file);
      if (fs.existsSync(resolved)) return resolved;
    } catch {
      continue;
    }
  }
  return "";
}

function woffTables(data: Buffer): Tables {
  if (data.toString("latin1", 0, 4) !== "wOFF") throw invalidConfig("design.titles.fit reads WOFF title fonts only");
  const tables: Tables = new Map();
  const count = data.readUInt16BE(12);
  for (let index = 0; index < count; index++) {
    const entry = 44 + index * 20;
    const [offset, packed, length] = [data.readUInt32BE(entry + 4), data.readUInt32BE(entry + 8), data.readUInt32BE(entry + 12)];
    const raw = data.subarray(offset, offset + packed);
    tables.set(data.toString("latin1", entry, entry + 4), packed < length ? zlib.inflateSync(raw) : raw);
  }
  return tables;
}

function cmapFormat4(cmap: Buffer): Map<number, number> {
  const count = cmap.readUInt16BE(2);
  for (let index = 0; index < count; index++) {
    const record = 4 + index * 8;
    const offset = cmap.readUInt32BE(record + 4);
    if (cmap.readUInt16BE(record) !== 3 || cmap.readUInt16BE(record + 2) !== 1 || cmap.readUInt16BE(offset) !== 4) continue;
    return segments(cmap, offset);
  }
  throw invalidConfig("design.titles.fit needs a title font with a Unicode BMP character map");
}

function segments(cmap: Buffer, start: number): Map<number, number> {
  const glyphs = new Map<number, number>();
  const segCount = cmap.readUInt16BE(start + 6) / 2;
  const ends = start + 14;
  const [starts, deltas, ranges] = [ends + segCount * 2 + 2, ends + segCount * 4 + 2, ends + segCount * 6 + 2];
  for (let code = GLYPH_FIRST; code <= GLYPH_LAST; code++) {
    for (let seg = 0; seg < segCount; seg++) {
      if (code > cmap.readUInt16BE(ends + seg * 2)) continue;
      const first = cmap.readUInt16BE(starts + seg * 2);
      if (code < first) break;
      const rangeOffset = cmap.readUInt16BE(ranges + seg * 2);
      const delta = cmap.readInt16BE(deltas + seg * 2);
      const base = rangeOffset ? cmap.readUInt16BE(ranges + seg * 2 + rangeOffset + (code - first) * 2) : code;
      if (base) glyphs.set(code, (base + delta)&0xffff);
      break;
    }
  }
  return glyphs;
}

function advances(tables: Tables): (glyph: number) => number {
  const [head, hhea, hmtx] = [tables.get("head"), tables.get("hhea"), tables.get("hmtx")];
  if (!head || !hhea || !hmtx) throw invalidConfig("design.titles.fit title font is missing head, hhea or hmtx");
  const units = head.readUInt16BE(18);
  const metrics = hhea.readUInt16BE(34);
  return (glyph) => hmtx.readUInt16BE(Math.min(glyph, metrics - 1) * 4) / units;
}

function emLength(value: unknown): number {
  const match = /^(-?[\d.]+)em$/u.exec(String(value ?? "").trim());
  return match ? Number(match[1]) : 0;
}

function glyphWidths(file: string, heading: Record<string, unknown>): Record<string, number> {
  const tables = woffTables(fs.readFileSync(file));
  const cmap = tables.get("cmap");
  if (!cmap) throw invalidConfig("design.titles.fit title font has no character map");
  const map = cmapFormat4(cmap);
  const width = advances(tables);
  const upper = String(heading.textTransform || "").trim() === "uppercase";
  const spacing = emLength(heading.letterSpacing);
  const glyphs: Record<string, number> = {};
  for (let code = GLYPH_FIRST; code <= GLYPH_LAST; code++) {
    const shown = upper && code >= LOWER_A && code <= LOWER_Z ? code - 32 : code;
    const glyph = map.get(shown);
    if (glyph !== undefined) glyphs[String(code)] = Number((width(glyph) + spacing).toFixed(4));
  }
  const letters = Array.from({ length: 26 }, (_, index) => glyphs[String(65 + index)] || 0).filter(Boolean);
  glyphs[GLYPH_OTHER] = Number((letters.reduce((sum, value) => sum + value, 0) / Math.max(1, letters.length)).toFixed(4));
  return glyphs;
}

function headingFamily(fonts: NormalizedFrontendFontConfig, heading: Record<string, unknown>, key: unknown): NormalizedFrontendFontFamilyConfig {
  if (key !== undefined) {
    const family = fonts.families.find((entry) => entry.key === String(key));
    if (!family) throw invalidConfig(`design.titles.fit.font ${String(key)} is not a key of assets.fonts.families`);
    return family;
  }
  const stack = String(heading.fontFamily || "").toLowerCase();
  const family = fonts.families
  .map((entry) => ({ entry, at: stack.indexOf(entry.family.toLowerCase()) }))
  .filter(({ at }) => at >= 0)
  .sort((a, b) => a.at - b.at)[0]?.entry;
  if (!family) throw invalidConfig("design.titles.fit.font is required when design.semantics.heading.fontFamily names no configured font");
  return family;
}

function titleWeight(family: NormalizedFrontendFontFamilyConfig, heading: Record<string, unknown>, value: unknown): number {
  const weight = Number(value ?? heading.fontWeight ?? 400);
  if (!family.weights.includes(weight)) {
    throw invalidConfig(`design.titles.fit.weight ${weight} is not a loaded weight of ${family.family}`);
  }
  return weight;
}

function normalizeTitlesConfig(value: unknown, source: TitleSource): NormalizedFrontendTitlesConfig {
  if (value === undefined) return { fit: null };
  const config = assertPlainObject(value, "design.titles");
  if (config.fit === undefined || config.fit === false) return { fit: null };
  const fit = assertPlainObject(config.fit, "design.titles.fit");
  const unknown = Object.keys(fit).filter((key) => !FIT_FIELDS.includes(key));
  if (unknown.length) throw invalidConfig(`design.titles.fit has unknown fields :: ${unknown.join(", ")}`);
  const below = String(fit.below ?? "md");
  if (!source.breakpoints[below]) throw invalidConfig(`design.titles.fit.below ${below} is not a design breakpoint`);
  const family = headingFamily(source.fonts, source.heading, fit.font);
  const weight = titleWeight(family, source.heading, fit.weight);
  const file = resolvePackageFile(family.packageName, `files/${family.packageName}-latin-${weight}-normal.woff`);
  if (!file) throw invalidConfig(`design.titles.fit cannot find the latin ${weight} WOFF file of @fontsource/${family.packageName}`);
  return { fit: { below, glyphs: glyphWidths(file, source.heading) } };
}

function capOf(size: unknown): string {
  const text = String(size ?? "").trim();
  const clamp = /^clamp\(.*,\s*([^,()]+)\)$/u.exec(text);
  return (clamp ? clamp[1] : text).trim();
}

function renderTitlesCss(
  titles: NormalizedFrontendTitlesConfig,
  options: { breakpoints: Record<string, number>; semantics: Record<string, unknown>; textSteps: Record<string, number> },
): string[] {
  if (!titles.fit) return [];
  const cap = frontendCssVar("title-cap");
  const fitted = frontendCssVar("title-size");
  const glyphs = Object.entries(titles.fit.glyphs).map(([key, width]) => `  ${glyphVar(key)}: ${width};`);
  const levels = [1, 2, 3, 4, 5, 6].flatMap((level) => {
      const size = (options.semantics[`h${level}`] as Record<string, unknown>|undefined)?.fontSize;
      return size ? [`:where(h${level}) { ${cap}: ${capOf(size)}; }`] : [];
  });
  const steps = Object.entries(options.textSteps).sort(([a], [b]) => a.localeCompare(b))
  .map(([step, px]) => `.${FRONTEND_PREFIX}-text-${step} { ${cap}: ${Number((px / 16).toFixed(4))}rem; }`);
  const size = `min(var(${fitted}, 1em), var(${cap}, 1em))`;
  return [
    ":root {",
    ...glyphs,
    "}",
    ...levels,
    ...steps,
    `@media (max-width: ${options.breakpoints[titles.fit.below]}px) {`,
    `  .${FRONTEND_PREFIX}-title { container-type: inline-size; }`,
    `  .${FRONTEND_PREFIX}-title > .${FRONTEND_PREFIX}-title__fit { display: block; font-size: ${size}; text-wrap: balance; }`,
    "}",
  ];
}

export { normalizeTitlesConfig, renderTitlesCss };
export type { FrontendTitlesConfig, NormalizedFrontendTitlesConfig };
