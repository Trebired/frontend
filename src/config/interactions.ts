import { assertPlainObject, invalidConfig, normalizeBoolean } from "./shared.js";
import type {
  FrontendActivePressInteractionConfig,
  FrontendDesignInteractionsConfig,
  NormalizedFrontendDesignInteractionsConfig,
} from "./types.js";

function normalizeBrightness(value: unknown): string {
  if (value === undefined) return "0.9";
  const raw = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!raw) throw invalidConfig("design.interactions.activePress.brightness must be a number or non-empty string");
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw invalidConfig("design.interactions.activePress.brightness must be greater than zero");
  }
  return raw;
}

function normalizeActivePressInteraction(value: unknown): NormalizedFrontendDesignInteractionsConfig["activePress"] {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "design.interactions.activePress") as FrontendActivePressInteractionConfig;
  const enabled = normalizeBoolean(source.enabled, false, "design.interactions.activePress.enabled");
  const brightness = normalizeBrightness(source.brightness);
  return {
    brightness,
    enabled,
    filter: enabled ? `brightness(${brightness})` : "none",
  };
}

function normalizeInteractionsConfig(value: unknown): NormalizedFrontendDesignInteractionsConfig {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "design.interactions") as FrontendDesignInteractionsConfig;
  return {
    activePress: normalizeActivePressInteraction(source.activePress),
  };
}

export { normalizeInteractionsConfig };
