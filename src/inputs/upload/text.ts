import { escapeHtml, jsonScript as jsonScriptPayload, toText } from "#ndsvdqv80epr";

function bool(value: unknown) {
  if (value === true) return true;
  const text = String(value ?? "").trim().toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "on";
}

function splitTokens(value: unknown) {
  return String(value ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
}

export { bool, escapeHtml, jsonScriptPayload, splitTokens, toText };
