import type { FlashType } from "./types.js";

function flashIconSpec(type: FlashType): string {
  if (type === "success") return "remixicon checkbox-circle-line";
  if (type === "info") return "remixicon information-line";
  return "remixicon error-warning-line";
}

function flashFallbackIconText(type: FlashType): string {
  if (type === "success") return "OK";
  if (type === "info") return "i";
  return "!";
}

export { flashFallbackIconText, flashIconSpec };
