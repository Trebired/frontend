import { toObject } from "#aq4qe9opqpbm";
import { safeStr } from "./utils.js";
import type { LogStyle } from "./types.js";

export function getPalette(logStyle: LogStyle | null) {
  const style = toObject(logStyle);
  return toObject(style.colors);
}

export function getLevelStyles(logStyle: LogStyle | null) {
  const style = toObject(logStyle);
  return toObject(style.levels);
}

export function getLevelStyle(logStyle: LogStyle | null, level: unknown) {
  const levels = getLevelStyles(logStyle);
  const key = safeStr(level).toLowerCase();
  const base: any = toObject(levels[key] || levels.default);
  const colorByLevel = {
    error: "var(--canvas-ansi-1)",
    fail: "var(--canvas-ansi-1)",
    fatal: "var(--canvas-ansi-9)",
    warn: "var(--canvas-ansi-3)",
    warning: "var(--canvas-ansi-3)",
    success: "var(--canvas-ansi-10)",
    info: "var(--canvas-ansi-12)",
    debug: "var(--canvas-ansi-5)",
    trace: "var(--canvas-ansi-8)",
    default: "var(--canvas-ansi-7)",
  };

  return {
    ...base,
    color: colorByLevel[key] || base.color || colorByLevel.default,
  };
}
