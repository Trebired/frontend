import { assertPlainObject, invalidConfig, normalizeBoolean } from "./shared.js";
import type {
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendPaletteMode,
  NormalizedFrontendPaletteSemantic,
  FrontendPaletteFamilies,
} from "./types.js";

function familyStepDeclarations(
  scale: FrontendPaletteFamilies,
  suffix = "",
): string[] {
  const lines: string[] = [];
  for (const family of Object.keys(scale).sort()) {
    const steps = scale[family];
    for (const step of Object.keys(steps).sort()) {
      lines.push(`  --${family}-${step}${suffix}: ${steps[step]};`);
    }
  }
  return lines;
}

function paletteModeScaleDeclarations(mode: NormalizedFrontendPaletteMode): string[] {
  return familyStepDeclarations(mode.scale);
}

function paletteSemanticDeclarations(
  config: NormalizedFrontendPaletteConfig,
): string[] {
  return config.semantic.map(
    (entry) => `  --${entry.name}: var(--${entry.family}-${entry.step});`,
  );
}

function paletteSuffixedDeclarations(config: NormalizedFrontendPaletteConfig): string[] {
  if (!config.suffixedVariants) return [];
  const lines: string[] = [];
  for (const mode of config.modes) {
    lines.push(...familyStepDeclarations(mode.scale, `-${mode.key}`));
  }
  return lines;
}

function findPaletteMode(
  config: NormalizedFrontendPaletteConfig,
  modeKey: string,
): NormalizedFrontendPaletteMode | undefined {
  return config.modes.find((mode) => mode.key === modeKey);
}

const PALETTE_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/iu;
const COLOR_VALUE_RE = /^[^"'<>]+$/u;

function normalizeColorValue(value: unknown, pathLabel: string): string {
  if (typeof value !== "string" || !value.trim() || !COLOR_VALUE_RE.test(value)) {
    throw invalidConfig(`${pathLabel} must be a non-empty color value string`);
  }
  return value.trim();
}

function normalizePaletteKey(value: string, pathLabel: string): string {
  const key = String(value || "").trim();
  if (!PALETTE_KEY_RE.test(key)) {
    throw invalidConfig(`${pathLabel} must start with a letter or number and contain only letters, numbers, underscores, or hyphens`);
  }
  return key;
}

function normalizePaletteFamilies(value: unknown, pathLabel: string): FrontendPaletteFamilies {
  const source = assertPlainObject(value, pathLabel);
  const out: FrontendPaletteFamilies = {};
  for (const [family, stepsValue] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    const familyKey = normalizePaletteKey(family, `${pathLabel}.${family}`);
    const steps = assertPlainObject(stepsValue, `${pathLabel}.${family}`);
    out[familyKey] = {};
    for (const [step, color] of Object.entries(steps).sort(([a], [b]) => a.localeCompare(b))) {
      const stepKey = normalizePaletteKey(step, `${pathLabel}.${family}.${step}`);
      out[familyKey][stepKey] = normalizeColorValue(color, `${pathLabel}.${family}.${step}`);
    }
  }
  return out;
}

function normalizePaletteMode(
  key: string,
  source: Record<string, unknown>,
  themeModeKeys: readonly string[],
): NormalizedFrontendPaletteMode {
  const modeKey = normalizePaletteKey(key, `palette.modes.${key}`);
  if (!themeModeKeys.includes(modeKey)) {
    throw invalidConfig(`palette.modes.${key} must name a mode declared in theme.modes`);
  }
  return {
    key: modeKey,
    scale: normalizePaletteFamilies(source.scale, `palette.modes.${key}.scale`),
  };
}

function normalizePaletteModes(
  value: unknown,
  themeModeKeys: readonly string[],
): NormalizedFrontendPaletteMode[] {
  if (value === undefined) return [];
  const source = assertPlainObject(value, "palette.modes");
  const modes: NormalizedFrontendPaletteMode[] = [];
  for (const [key, item] of Object.entries(source)) {
    modes.push(normalizePaletteMode(key, assertPlainObject(item, `palette.modes.${key}`), themeModeKeys));
  }
  return modes;
}

function normalizePaletteSemantic(value: unknown): NormalizedFrontendPaletteSemantic[] {
  if (value === undefined) return [];
  const source = assertPlainObject(value, "palette.semantic");
  const out: NormalizedFrontendPaletteSemantic[] = [];
  for (const [name, refValue] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    const pathLabel = `palette.semantic.${name}`;
    const ref = assertPlainObject(refValue, pathLabel);
    out.push({
      family: normalizePaletteKey(String(ref.family || ""), `${pathLabel}.family`),
      name: normalizePaletteKey(name, pathLabel),
      step: normalizePaletteKey(String(ref.step || ""), `${pathLabel}.step`),
    });
  }
  return out;
}

function normalizePaletteConfig(
  value: unknown,
  themeModeKeys: readonly string[],
): NormalizedFrontendPaletteConfig {
  const source = value === undefined ? {} : assertPlainObject(value, "palette");
  return {
    modes: normalizePaletteModes(source.modes, themeModeKeys),
    semantic: normalizePaletteSemantic(source.semantic),
    suffixedVariants: normalizeBoolean(source.suffixedVariants, true, "palette.suffixedVariants"),
  };
}

export {
  findPaletteMode,
  normalizePaletteConfig,
  paletteModeScaleDeclarations,
  paletteSemanticDeclarations,
  paletteSuffixedDeclarations,
};
