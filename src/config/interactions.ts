import { assertPlainObject, invalidConfig, normalizeBoolean } from "./shared.js";
import type {
  FrontendActiveInteractionConfig,
  FrontendInteractionsConfig,
  NormalizedFrontendInteractionsConfig,
} from "./types.js";

function normalizeBrightness(value: unknown): string {
  if (value === undefined) return "0.9";
  const raw = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!raw) throw invalidConfig("interactions.active.brightness must be a number or non-empty string");
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw invalidConfig("interactions.active.brightness must be greater than zero");
  }
  return raw;
}

function normalizeActiveInteraction(value: unknown): NormalizedFrontendInteractionsConfig["active"] {
  const source = value === undefined
    ? {}
    : assertPlainObject(value, "interactions.active") as FrontendActiveInteractionConfig;
  const enabled = normalizeBoolean(source.enabled, true, "interactions.active.enabled");
  const brightness = normalizeBrightness(source.brightness);
  return {
    brightness,
    enabled,
    filter: enabled ? `brightness(${brightness})` : "none",
  };
}

function normalizeInteractionsConfig(value: unknown): NormalizedFrontendInteractionsConfig {
  const source = value === undefined
    ? {}
    : assertPlainObject(value, "interactions") as FrontendInteractionsConfig;
  return {
    active: normalizeActiveInteraction(source.active),
  };
}

export { normalizeInteractionsConfig };
