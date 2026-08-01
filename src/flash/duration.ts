import type { FlashType } from "./types.js";

const FLASH_CONFIRM_TIMEOUT_MS = 10000;
const FLASH_PROMPT_TIMEOUT_MS = 60000;
const FLASH_TYPES = new Set(["error", "info", "success", "warn"]);

function normalizeFlashType(value: unknown): FlashType {
  const text = String(value || "").trim().toLowerCase();
  return FLASH_TYPES.has(text) ? (text as FlashType) : "info";
}

function computeFlashDurationMs(message: unknown, description: unknown = "") {
  const text = [message, description].map((value) => String(value || "")).join(" ");
  const ms = 1600 + text.trim().length * 28;
  return Math.max(1800, Math.min(12000, ms));
}

function flashId(prefix = "flash") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  computeFlashDurationMs,
  flashId,
  normalizeFlashType,
};
