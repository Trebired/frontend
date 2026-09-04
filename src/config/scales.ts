import { assertPlainObject, invalidConfig } from "./shared.js";
import {
  DEFAULT_HEIGHT_SCALE,
  DEFAULT_LINE_HEIGHT_SCALE,
  DEFAULT_PADDING_SCALE,
  DEFAULT_RADIUS_SCALE,
  DEFAULT_SPACING_SCALE,
  DEFAULT_TEXT_SIZE_SCALE,
  DEFAULT_WIDTH_SCALE,
  DEFAULT_Z_INDEX_SCALE,
} from "./default/scales.js";
import type {
  NormalizedFrontendScalesConfig,
  NormalizedFrontendZIndexScaleConfig,
  FrontendScaleSteps,
} from "./types.js";

const SCALE_STEP_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/iu;

function normalizeScaleSteps(
  value: unknown,
  pathLabel: string,
  fallback: FrontendScaleSteps = {},
): FrontendScaleSteps {
  if (value === undefined) return { ...fallback };
  const source = assertPlainObject(value, pathLabel);
  const out: FrontendScaleSteps = {};
  for (const [step, amount] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    if (!SCALE_STEP_KEY_RE.test(step)) {
      throw invalidConfig(`${pathLabel}.${step} has an invalid step key`);
    }
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw invalidConfig(`${pathLabel}.${step} must be a finite number`);
    }
    out[step] = amount;
  }
  return out;
}

function normalizeZIndexRole(
  value: unknown,
  steps: FrontendScaleSteps,
  pathLabel: string,
): string {
  if (value === undefined || value === "") return "";
  const key = String(value).trim();
  if (!Object.prototype.hasOwnProperty.call(steps, key)) {
    throw invalidConfig(`${pathLabel} must name a step declared in scales.zIndex.steps`);
  }
  return key;
}

function normalizeZIndexScale(value: unknown): NormalizedFrontendZIndexScaleConfig {
  if (value === undefined) {
    return {
      ...DEFAULT_Z_INDEX_SCALE,
      steps: { ...DEFAULT_Z_INDEX_SCALE.steps },
    };
  }
  const source = assertPlainObject(value, "scales.zIndex");
  const steps = normalizeScaleSteps(source.steps, "scales.zIndex.steps");
  return {
    confetti: normalizeZIndexRole(source.confetti, steps, "scales.zIndex.confetti"),
    layerRoot: normalizeZIndexRole(source.layerRoot, steps, "scales.zIndex.layerRoot"),
    progress: normalizeZIndexRole(source.progress, steps, "scales.zIndex.progress"),
    steps,
  };
}

function normalizeScalesConfig(value: unknown): NormalizedFrontendScalesConfig {
  const source = value === undefined ? {} : assertPlainObject(value, "scales");
  return {
    height: normalizeScaleSteps(source.height, "scales.height", DEFAULT_HEIGHT_SCALE),
    lineHeight: normalizeScaleSteps(source.lineHeight, "scales.lineHeight", DEFAULT_LINE_HEIGHT_SCALE),
    padding: normalizeScaleSteps(source.padding, "scales.padding", DEFAULT_PADDING_SCALE),
    radius: normalizeScaleSteps(source.radius, "scales.radius", DEFAULT_RADIUS_SCALE),
    spacing: normalizeScaleSteps(source.spacing, "scales.spacing", DEFAULT_SPACING_SCALE),
    textSize: normalizeScaleSteps(source.textSize, "scales.textSize", DEFAULT_TEXT_SIZE_SCALE),
    width: normalizeScaleSteps(source.width, "scales.width", DEFAULT_WIDTH_SCALE),
    zIndex: normalizeZIndexScale(source.zIndex),
  };
}

export { normalizeScalesConfig };
