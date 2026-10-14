import type {
  A11yContrastPreference,
  A11yMotionPreference,
  A11yTextSize,
  FrontendA11ySettings,
} from "./../../a11y/types.js";

type FrontendA11yConfig = {
  cookie?: boolean;
  defaults?: {
    contrast?: A11yContrastPreference;
    motion?: A11yMotionPreference;
    textSize?: A11yTextSize;
  };
  textSizes?: A11yTextSize[];
};

type NormalizedFrontendA11yConfig = {
  cookie: boolean;
  defaults: FrontendA11ySettings;
  textSizes: A11yTextSize[];
};

export type { FrontendA11yConfig, NormalizedFrontendA11yConfig };
