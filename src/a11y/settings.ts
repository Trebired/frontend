import type {
  A11yContrastPreference,
  A11yMotionPreference,
  A11yTextSize,
  FrontendA11ySettings,
} from "./types.js";

const TEXT_SIZES: A11yTextSize[] = [100, 125, 150, 200];

const MOTION_VALUES: A11yMotionPreference[] = ["full", "reduce", "system"];

const CONTRAST_VALUES: A11yContrastPreference[] = ["high", "normal", "system"];

const EMPTY_A11Y_SETTINGS: FrontendA11ySettings = Object.freeze({
    contrast: "system",
    motion: "system",
    textSize: 100,
}) as FrontendA11ySettings;

function motionOf(value: unknown): A11yMotionPreference {
  const next = String(value || "").trim().toLowerCase();
  return MOTION_VALUES.includes(next as A11yMotionPreference)
  ? next as A11yMotionPreference
  : EMPTY_A11Y_SETTINGS.motion;
}

function contrastOf(value: unknown): A11yContrastPreference {
  const next = String(value || "").trim().toLowerCase();
  return CONTRAST_VALUES.includes(next as A11yContrastPreference)
  ? next as A11yContrastPreference
  : EMPTY_A11Y_SETTINGS.contrast;
}

function textSizeOf(value: unknown): A11yTextSize {
  const next = Number(value);
  return TEXT_SIZES.includes(next as A11yTextSize)
  ? next as A11yTextSize
  : EMPTY_A11Y_SETTINGS.textSize;
}

function normalizeA11ySettings(value: unknown): FrontendA11ySettings {
  if (!value || typeof value !== "object") return { ...EMPTY_A11Y_SETTINGS };
  const source = value as Record<string, unknown>;
  return {
    contrast: contrastOf(source.contrast),
    motion: motionOf(source.motion),
    textSize: textSizeOf(source.textSize),
  };
}

function mergeA11ySettings(
  current: FrontendA11ySettings,
  patch: Partial<FrontendA11ySettings>,
): FrontendA11ySettings {
  return normalizeA11ySettings({ ...current, ...patch });
}

export {
  CONTRAST_VALUES,
  EMPTY_A11Y_SETTINGS,
  mergeA11ySettings,
  MOTION_VALUES,
  normalizeA11ySettings,
  TEXT_SIZES,
};
