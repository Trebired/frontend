import { assertPlainObject, invalidConfig } from "./shared.js";

type FrontendBreakpoints = Record<string, number>;

const BREAKPOINT_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/iu;

const DEFAULT_FRONTEND_BREAKPOINTS: FrontendBreakpoints = {
  lg: 900,
  md: 768,
  sm: 640,
  xs: 560,
  xs2: 380,
};

function normalizeBreakpointsConfig(value: unknown): FrontendBreakpoints {
  if (value === undefined) return { ...DEFAULT_FRONTEND_BREAKPOINTS };
  const source = assertPlainObject(value, "design.breakpoints");
  const out: FrontendBreakpoints = {};
  for (const [key, amount] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    if (!BREAKPOINT_KEY_RE.test(key)) {
      throw invalidConfig(`design.breakpoints.${key} has an invalid name`);
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw invalidConfig(`design.breakpoints.${key} must be a positive number`);
    }
    out[key] = amount;
  }
  return out;
}

function breakpointEntries(breakpoints: FrontendBreakpoints): Array<[string, number]> {
  return Object.entries(breakpoints).sort(([, a], [, b]) => b - a);
}

function breakpointDeclarations(
  prefix: string,
  breakpoints: FrontendBreakpoints,
): string[] {
  return Object.entries(breakpoints)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `  --${prefix}-bp-${key}: ${value}px;`);
}

export {
  DEFAULT_FRONTEND_BREAKPOINTS,
  breakpointDeclarations,
  breakpointEntries,
  normalizeBreakpointsConfig,
};
export type { FrontendBreakpoints };
