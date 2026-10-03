import { assertPlainObject } from "./shared.js";
import type { FrontendGlassConfig, NormalizedFrontendGlassConfig } from "./types/glass.js";

const GLASS_FIELDS = ["blur", "border", "color", "opacity", "saturate"];

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
  return {
    blur: glassField(source, "blur", "16px"),
    border: glassField(source, "border", "none"),
    color: glassField(source, "color", "transparent"),
    opacity: glassField(source, "opacity", "12%"),
    saturate: glassField(source, "saturate", "180%"),
  };
}

export { normalizeGlassConfig };
