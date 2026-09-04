import { componentTokenCssName } from "#lccfzjsnej6t";
import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { breakpointEntries } from "./breakpoints.js";
import { flattenThemeTokens } from "./theme.js";
import type { FrontendThemeTokens, NormalizedFrontendConfig } from "./types.js";

type ResponsiveValue = string | number | Record<string, string|number>;

const CONTAINER_DEFAULT_PX: Record<string, string> = {
  base: "24px",
  md: "16px",
  xs: "12px",
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function responsiveSteps(
  value: ResponsiveValue,
  breakpoints: Record<string, number>,
): Array<[string|null, string]> {
  if (!isPlainRecord(value)) return [[null, String(value)]];
  const steps: Array<[string|null, string]> = [];
  if (value.base !== undefined) steps.push([null, String(value.base)]);
  for (const [name] of breakpointEntries(breakpoints)) {
    if (value[name] !== undefined) steps.push([name, String(value[name])]);
  }
  return steps;
}

function wrapInBreakpoint(
  breakpoint: string | null,
  breakpoints: Record<string, number>,
  body: string[],
): string[] {
  if (!breakpoint) return body;
  const width = breakpoints[breakpoint];
  if (!width) return [];
  return [`@media (max-width: ${width}px) {`, ...body.map((line) => `  ${line}`), "}"];
}

function containerConfig(config: NormalizedFrontendConfig): ResponsiveValue {
  const typography = (config.components as Record<string, any>)?.typography;
  const declared = typography?.container?.px;
  return declared === undefined ? { ...CONTAINER_DEFAULT_PX } : declared;
}

function renderContainerRules(config: NormalizedFrontendConfig): string[] {
  const lines: string[] = [];
  for (const [breakpoint, value] of responsiveSteps(
      containerConfig(config),
      config.design.breakpoints,
  )) {
    lines.push(
      ...wrapInBreakpoint(breakpoint, config.design.breakpoints, [
          ":root {",
          `  --${config.prefix}-container-px: ${value};`,
          "}",
      ]),
    );
  }
  return lines;
}

const HEADING_PROPERTIES: string[] = [
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "text-transform",
];

function headingVariants(config: NormalizedFrontendConfig): Array<[string, FrontendThemeTokens]> {
  const typography = (config.components as Record<string, any>)?.typography;
  const variants = typography?.heading?.variants;
  if (!isPlainRecord(variants)) return [];
  const out: Array<[string, FrontendThemeTokens]> = [];
  for (const [key, value] of Object.entries(variants)) {
    const name = componentTokenCssName(key);
    if (name && isPlainRecord(value)) out.push([name, value as FrontendThemeTokens]);
  }
  return out;
}

function renderHeadingVariantRules(config: NormalizedFrontendConfig): string[] {
  const lines: string[] = [];
  const declarations: string[] = [];

  for (const [variant, tokens] of headingVariants(config)) {
    const values = new Map(
      flattenThemeTokens(tokens).map(([key, value]) => [
          componentTokenCssName(key),
          String(value),
      ]),
    );
    const cssVarName = (token: string) => `--${config.prefix}-heading-${variant}-${token}`;
    const selector = `.${FRONTEND_PREFIX}-heading--${variant}`;
    const base: string[] = [];
    const responsive = new Map<string, string[]>();

    for (const property of HEADING_PROPERTIES) {
      const token = componentTokenCssName(property);
      if (values.has(token)) {
        declarations.push(`  ${cssVarName(token)}: ${values.get(token)};`);
        base.push(`  ${property}: var(${cssVarName(token)});`);
      }
      for (const [name] of breakpointEntries(config.design.breakpoints)) {
        const responsiveToken = `${token}-${name}`;
        if (!values.has(responsiveToken)) continue;
        declarations.push(`  ${cssVarName(responsiveToken)}: ${values.get(responsiveToken)};`);
        const list = responsive.get(name) || [];
        list.push(`  ${property}: var(${cssVarName(responsiveToken)});`);
        responsive.set(name, list);
      }
    }

    if (base.length) lines.push(`${selector} {`, ...base, "}");
    for (const [name, body] of responsive) {
      lines.push(
        ...wrapInBreakpoint(name, config.design.breakpoints, [
            `${selector} {`,
            ...body,
            "}",
        ]),
      );
    }
  }

  return declarations.length
  ? [":root {", ...declarations, "}", ...lines]
  : lines;
}

export { renderContainerRules, renderHeadingVariantRules };
export type { ResponsiveValue };
