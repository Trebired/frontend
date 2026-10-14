import { assertPlainObject } from "./shared.js";
import type { FrontendGlassConfig, NormalizedFrontendGlassConfig } from "./types/glass.js";

const GLASS_FIELDS = ["blur", "clear", "color", "opacity", "saturate", "tint"];

const TINTS: Record<string, string> = { dark: "ink", light: "page", none: "transparent" };

function glassField(source: FrontendGlassConfig, key: keyof FrontendGlassConfig, fallback: string): string {
  const value = source[key];
  if (value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function normalizeGlassConfig(value: unknown): NormalizedFrontendGlassConfig | null {
  if (value === undefined) return null;
  const source = assertPlainObject(value, "design.glass") as FrontendGlassConfig;
  for (const key of Object.keys(source)) {
    if (!GLASS_FIELDS.includes(key)) {
      throw new Error(`design.glass has an unknown field: ${key}`);
    }
  }
  const tint = glassField(source, "tint", "");
  if (tint && !Object.prototype.hasOwnProperty.call(TINTS, tint)) {
    throw new Error(`design.glass.tint must be one of ${Object.keys(TINTS).join(", ")}`);
  }
  return {
    blur: glassField(source, "blur", "16px"),
    clear: glassField(source, "clear", "transparent"),
    color: glassField(source, "color", TINTS[tint] || "transparent"),
    opacity: glassField(source, "opacity", "72%"),
    saturate: glassField(source, "saturate", "110%"),
  };
}

export { normalizeGlassConfig };
