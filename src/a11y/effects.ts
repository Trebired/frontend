import { refreshMotifs } from "./../surface/motif/runtime.js";

import type { ResolvedFrontendA11ySettings } from "./types.js";

let lastMotion: boolean | null = null;

let lastContrast: boolean | null = null;

function runA11yEffects(resolved: ResolvedFrontendA11ySettings): void {
  if (resolved.reduceMotion !== lastMotion) {
    lastMotion = resolved.reduceMotion;
    refreshMotifs();
  }
  if (resolved.highContrast !== lastContrast) {
    lastContrast = resolved.highContrast;
  }
}

export { runA11yEffects };
