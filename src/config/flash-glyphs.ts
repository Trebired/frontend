import { buildRenderedIconCacheEntry } from "./../icons/server/index.js";
import { invalidConfig } from "./shared.js";
import type { NormalizedFrontendConfig } from "./types.js";

type FlashLevel = "error" | "info" | "success" | "warn";

const FLASH_LEVELS: readonly FlashLevel[] = ["error", "info", "success", "warn"];

const FLASH_GLYPH_VARIANTS: Record<string, Record<FlashLevel, string>> = {
  circled: {
    error: "remixicon close-circle-line",
    info: "remixicon information-line",
    success: "remixicon checkbox-circle-line",
    warn: "remixicon error-warning-line",
  },
  filled: {
    error: "remixicon close-circle-fill",
    info: "remixicon information-fill",
    success: "remixicon checkbox-circle-fill",
    warn: "remixicon error-warning-fill",
  },
  plain: {
    error: "remixicon close-line",
    info: "remixicon info-i",
    success: "remixicon check-line",
    warn: "remixicon alert-line",
  },
};

const GLYPH_TOKEN_RE = /^flash-intents-(error|info|success|warn)-glyph$/u;

function flashGlyphSpec(level: FlashLevel, value: unknown) {
  const choice = String(value ?? "").trim();
  const variant = FLASH_GLYPH_VARIANTS[choice];
  return variant ? variant[level] : choice;
}

function resolveFlashGlyph(level: FlashLevel, value: unknown, config: NormalizedFrontendConfig) {
  const spec = flashGlyphSpec(level, value);
  if (!spec) return null;
  const builtIn = Boolean(FLASH_GLYPH_VARIANTS[String(value ?? "").trim()]);
  return buildRenderedIconCacheEntry(spec, builtIn ? {} : { packs: config.assets.icons.packs });
}

function flashGlyphUrl(level: FlashLevel, value: unknown, config: NormalizedFrontendConfig) {
  const entry = resolveFlashGlyph(level, value, config);
  if (!entry) {
    const variants = Object.keys(FLASH_GLYPH_VARIANTS).join(", ");
    throw invalidConfig(`components.feedback.flash.intents.${level}.glyph must be one of ${variants} or an icon spec, got "${String(value)}"`);
  }
  return `url("data:image/svg+xml,${encodeURIComponent(entry.svg)}")`;
}

function iconTokenUrl(path: string, value: unknown, config: NormalizedFrontendConfig) {
  const spec = String(value ?? "").trim();
  if (!spec || spec === "none") return "none";
  const entry = buildRenderedIconCacheEntry(spec, { packs: config.assets.icons.packs });
  if (!entry) throw invalidConfig(`${path} must be an icon spec or "none", got "${spec}"`);
  return `url("data:image/svg+xml,${encodeURIComponent(entry.svg)}")`;
}

function componentTokenValue(group: string, key: string, value: string | number, config: NormalizedFrontendConfig) {
  const glyph = group === "feedback" ? GLYPH_TOKEN_RE.exec(key) : null;
  if (glyph) return flashGlyphUrl(glyph[1] as FlashLevel, value, config);
  if (group === "shell" && key === "breadcrumb-glyph") return iconTokenUrl("components.shell.breadcrumb.glyph", value, config);
  return String(value);
}

export { FLASH_GLYPH_VARIANTS, FLASH_LEVELS, componentTokenValue, flashGlyphSpec };
export type { FlashLevel };
