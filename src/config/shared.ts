const CONFIG_ERROR_PREFIX = "trebired-frontend-invalid-config";

function invalidConfig(message: string): Error {
  return new Error(`${CONFIG_ERROR_PREFIX} :: ${message}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function assertPlainObject(value: unknown, pathLabel: string): Record<string, unknown> {
  if (!isPlainObject(value)) throw invalidConfig(`${pathLabel} must be an object`);
  return value;
}

function normalizeBoolean(value: unknown, defaultValue: boolean, pathLabel: string): boolean {
  if (value === undefined) return defaultValue;
  if (typeof value !== "boolean") throw invalidConfig(`${pathLabel} must be boolean`);
  return value;
}

function cssString(value: unknown): string {
  return JSON.stringify(String(value ?? ""));
}

function cssComment(value: unknown): string {
  return String(value || "").replace(/\*\//gu, "* /");
}

export {
  CONFIG_ERROR_PREFIX,
  assertPlainObject,
  cssComment,
  cssString,
  invalidConfig,
  isPlainObject,
  normalizeBoolean,
};
