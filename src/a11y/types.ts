type A11yMotionPreference = "full" | "reduce" | "system";

type A11yContrastPreference = "high" | "normal" | "system";

type A11yTextSize = 100 | 125 | 150 | 200;

type FrontendA11ySettings = {
  contrast: A11yContrastPreference;
  motion: A11yMotionPreference;
  textSize: A11yTextSize;
};

type ResolvedFrontendA11ySettings = FrontendA11ySettings& {
  highContrast: boolean;
  reduceMotion: boolean;
};

export type {
  A11yContrastPreference,
  A11yMotionPreference,
  A11yTextSize,
  FrontendA11ySettings,
  ResolvedFrontendA11ySettings,
};
