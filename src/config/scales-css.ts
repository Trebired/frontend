import type {
  NormalizedFrontendScalesConfig,
  NormalizedFrontendZIndexScaleConfig,
  FrontendScaleSteps,
} from "./types.js";

type ScaleCss = { body: string[]; vars: string[] };

function stepEntries(steps: FrontendScaleSteps): Array<[string, number]> {
  return Object.entries(steps).sort(([a], [b]) => a.localeCompare(b));
}

function renderSpacingScale(steps: FrontendScaleSteps): ScaleCss {
  const vars = stepEntries(steps).map(([step, v]) => `  --space-${step}: ${v}px;`);
  const body: string[] = [];
  for (const [step] of stepEntries(steps)) {
    body.push(
      `@mixin gap-${step} { gap: var(--space-${step}); }`,
      `.gap-${step} { @include gap-${step}; }`,
      `.mt-${step} { margin-top: var(--space-${step}); }`,
      `.mb-${step} { margin-bottom: var(--space-${step}); }`,
      `.ml-${step} { margin-left: var(--space-${step}); }`,
      `.mr-${step} { margin-right: var(--space-${step}); }`,
    );
  }
  return { body, vars };
}

function renderPaddingScale(steps: FrontendScaleSteps): ScaleCss {
  const sides = ["top", "right", "bottom", "left"];
  const body: string[] = [];
  for (const [step, v] of stepEntries(steps)) {
    body.push(
      `@mixin padding-${step} { padding: ${v}px; }`,
      `.padding-${step} { @include padding-${step}; --scroll-min-padding-bottom: ${v}px; }`,
    );
    for (const side of sides) {
      const extra = side === "bottom" ? ` --scroll-min-padding-bottom: ${v}px;` : "";
      body.push(`.padding-${side}-${step} { padding-${side}: ${v}px;${extra} }`);
    }
  }
  body.push(".padding-0 { padding: 0; }");
  return { body, vars: [] };
}

function radiusValueMixin(name: string, value: string): string {
  return `@mixin ${name}($important: false) { @if $important { border-radius: ${value} !important; } @else { border-radius: ${value}; } }`;
}

function renderRadiusScale(steps: FrontendScaleSteps): ScaleCss {
  const vars: string[] = [];
  const body: string[] = [];
  for (const [step, v] of stepEntries(steps)) {
    vars.push(`  --radius-${step}: ${v}px;`);
    body.push(
      radiusValueMixin(`radius-${step}`, `${v}px`),
      `.radius-${step} { @include radius-${step}(true); }`,
    );
  }
  if (Object.prototype.hasOwnProperty.call(steps, "lg")) {
    body.push(radiusValueMixin("radius-lg-plus", "calc(var(--radius-lg) + 6px)"));
  }
  if (Object.prototype.hasOwnProperty.call(steps, "sm")) {
    body.push(
      "@mixin radius-left-sm { border-top-left-radius: var(--radius-sm); border-bottom-left-radius: var(--radius-sm); }",
      "@mixin radius-right-sm { border-top-right-radius: var(--radius-sm); border-bottom-right-radius: var(--radius-sm); }",
    );
  }
  body.push(
    radiusValueMixin("radius-2xs", "2px"),
    radiusValueMixin("radius-none", "0"),
    radiusValueMixin("radius-pill", "999px"),
    radiusValueMixin("radius-circle", "50%"),
    radiusValueMixin("radius-inherit", "inherit"),
  );
  return { body, vars };
}

function renderHeightScale(steps: FrontendScaleSteps): ScaleCss {
  const vars: string[] = [];
  const body: string[] = [];
  for (const [step, v] of stepEntries(steps)) {
    vars.push(`  --height-${step}: ${v}px;`);
    body.push(
      `.height-${step} { height: var(--height-${step}) !important; }`,
      `.min-height-${step} { min-height: var(--height-${step}) !important; }`,
      `.max-height-${step} { max-height: var(--height-${step}) !important; }`,
    );
  }
  if (Object.keys(steps).length) {
    body.push(
      ".height-max { height: 100% !important; }",
      ".min-height-max { min-height: 100% !important; }",
      ".max-height-max { max-height: 100% !important; }",
      ".height-fit { height: fit-content !important; }",
      ".min-height-fit { min-height: fit-content !important; }",
      ".max-height-fit { max-height: fit-content !important; }",
    );
  }
  return { body, vars };
}

function renderWidthScale(steps: FrontendScaleSteps): ScaleCss {
  const body = stepEntries(steps).map(
    ([step, v]) => `.width-${step} { width: min(100%, ${v}px) !important; }`,
  );
  return { body, vars: [] };
}

function renderTextSizeScale(steps: FrontendScaleSteps): ScaleCss {
  const body = stepEntries(steps).map(([step, v]) => `.text-${step} { font-size: ${v}px; }`);
  return { body, vars: [] };
}

function renderLineHeightScale(steps: FrontendScaleSteps): ScaleCss {
  const body: string[] = [];
  for (const [step, v] of stepEntries(steps)) {
    body.push(
      `@mixin lh-${step} { line-height: ${v}; }`,
      `.lh-${step} { @include lh-${step}; }`,
    );
  }
  return { body, vars: [] };
}

function renderZIndexScale(config: NormalizedFrontendZIndexScaleConfig): ScaleCss {
  const vars: string[] = [];
  const body: string[] = [];
  for (const [step, v] of stepEntries(config.steps)) {
    vars.push(`  --z-index-${step}: ${v};`);
    body.push(`.z-index-${step} { z-index: var(--z-index-${step}); }`);
  }
  if (config.layerRoot) vars.push(`  --z-layer-root: var(--z-index-${config.layerRoot});`);
  if (config.progress) vars.push(`  --z-progress: var(--z-index-${config.progress});`);
  if (config.confetti) vars.push(`  --z-confetti: var(--z-index-${config.confetti});`);
  return { body, vars };
}

function renderScalesCss(config: NormalizedFrontendScalesConfig): ScaleCss {
  const parts = [
    renderSpacingScale(config.spacing),
    renderPaddingScale(config.padding),
    renderRadiusScale(config.radius),
    renderHeightScale(config.height),
    renderWidthScale(config.width),
    renderTextSizeScale(config.textSize),
    renderLineHeightScale(config.lineHeight),
    renderZIndexScale(config.zIndex),
  ];
  return {
    body: parts.flatMap((part) => part.body),
    vars: parts.flatMap((part) => part.vars),
  };
}

export { renderScalesCss };
