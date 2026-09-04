import type {
  NormalizedFrontendScalesConfig,
  NormalizedFrontendZIndexScaleConfig,
  FrontendScaleSteps,
} from "#tf6lk8wu8qd2";

const DEFAULT_HEIGHT_SCALE: FrontendScaleSteps = {
  lg: 400, md: 300, sm: 200, xl: 500, xl2: 600, xl3: 700, xl4: 800,
  xl5: 900, xl6: 1000, xs: 150, xs2: 100, xs3: 50, xs4: 35, xs5: 20,
};

const DEFAULT_LINE_HEIGHT_SCALE: FrontendScaleSteps = {
  lg: 1.8, lg2: 1.75, lg3: 1.7, md: 1.6, md2: 1.55, md3: 1.5, none: 1,
  sm: 1.4, sm2: 1.35, sm3: 1.3, xl: 2, xl2: 1.95, xl3: 1.9,
  xs: 1.2, xs2: 1.1, xs3: 1.05,
};

const DEFAULT_PADDING_SCALE: FrontendScaleSteps = {
  lg: 20, md: 14, sm: 10, xl: 28, xs: 6,
};

const DEFAULT_RADIUS_SCALE: FrontendScaleSteps = {
  lg: 10, md: 8, sm: 6, xl: 12, xl2: 14, xs: 4,
};

const DEFAULT_SPACING_SCALE: FrontendScaleSteps = {
  lg: 40, md: 24, sm: 12, xs: 8, xs2: 4,
};

const DEFAULT_TEXT_SIZE_SCALE: FrontendScaleSteps = {
  lg: 20, md: 16, sm: 14, xl: 24, xl2: 32, xl3: 40, xl4: 56, xl5: 72, xs: 12,
};

const DEFAULT_WIDTH_SCALE: FrontendScaleSteps = {
  lg: 400, md: 300, sm: 200, xl: 500, xl2: 600, xl3: 700, xl4: 800,
  xl5: 900, xl6: 1000, xs: 150, xs2: 100,
};

const DEFAULT_Z_INDEX_SCALE: NormalizedFrontendZIndexScaleConfig = {
  confetti: "",
  layerRoot: "sm",
  progress: "xl",
  steps: { lg: 1020, md: 1010, sm: 1000, xl: 1100, xs: 900 },
};

const DEFAULT_FRONTEND_SCALES_CONFIG = Object.freeze({
    height: Object.freeze({ ...DEFAULT_HEIGHT_SCALE }),
    lineHeight: Object.freeze({ ...DEFAULT_LINE_HEIGHT_SCALE }),
    padding: Object.freeze({ ...DEFAULT_PADDING_SCALE }),
    radius: Object.freeze({ ...DEFAULT_RADIUS_SCALE }),
    spacing: Object.freeze({ ...DEFAULT_SPACING_SCALE }),
    textSize: Object.freeze({ ...DEFAULT_TEXT_SIZE_SCALE }),
    width: Object.freeze({ ...DEFAULT_WIDTH_SCALE }),
    zIndex: Object.freeze({
        ...DEFAULT_Z_INDEX_SCALE,
        steps: Object.freeze({ ...DEFAULT_Z_INDEX_SCALE.steps }),
    }),
}) as NormalizedFrontendScalesConfig;

export {
  DEFAULT_FRONTEND_SCALES_CONFIG,
  DEFAULT_HEIGHT_SCALE,
  DEFAULT_LINE_HEIGHT_SCALE,
  DEFAULT_PADDING_SCALE,
  DEFAULT_RADIUS_SCALE,
  DEFAULT_SPACING_SCALE,
  DEFAULT_TEXT_SIZE_SCALE,
  DEFAULT_WIDTH_SCALE,
  DEFAULT_Z_INDEX_SCALE,
};
