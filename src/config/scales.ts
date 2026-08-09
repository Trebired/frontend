import { assertPlainObject, invalidConfig } from "./shared.js";
import type {
  NormalizedFrontendScalesConfig,
  NormalizedFrontendZIndexScaleConfig,
  FrontendScaleSteps,
} from "./types.js";

const SCALE_STEP_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/iu;

function normalizeScaleSteps(value: unknown, pathLabel: string): FrontendScaleSteps {
  if (value === undefined) return {};
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
    return { confetti: "", layerRoot: "", progress: "", steps: {} };
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
    height: normalizeScaleSteps(source.height, "scales.height"),
    lineHeight: normalizeScaleSteps(source.lineHeight, "scales.lineHeight"),
    padding: normalizeScaleSteps(source.padding, "scales.padding"),
    radius: normalizeScaleSteps(source.radius, "scales.radius"),
    spacing: normalizeScaleSteps(source.spacing, "scales.spacing"),
    textSize: normalizeScaleSteps(source.textSize, "scales.textSize"),
    width: normalizeScaleSteps(source.width, "scales.width"),
    zIndex: normalizeZIndexScale(source.zIndex),
  };
}

export { normalizeScalesConfig };
