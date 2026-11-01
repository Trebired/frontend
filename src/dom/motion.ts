import { frontendCssVar } from "#5vbaqj4pirp3";

function cssToken(element: Element | null | undefined, name: string, fallback: string): string {
  if (typeof getComputedStyle !== "function" || typeof document === "undefined") return fallback;
  try {
    const value = getComputedStyle(element || document.documentElement)
    .getPropertyValue(frontendCssVar(name))
    .trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

function cssTimeMs(element: Element | null | undefined, name: string, fallbackMs: number): number {
  const raw = cssToken(element, name, "");
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallbackMs;
  if (raw.endsWith("ms")) return value;
  if (raw.endsWith("s")) return value * 1000;
  return fallbackMs;
}

export { cssTimeMs, cssToken };
