import { isRecord as isPlainObject } from "@trebired/utils";

const CONFIG_ERROR_PREFIX = "frontend-invalid-config";

function invalidConfig(message: string): Error {
  return new Error(`${CONFIG_ERROR_PREFIX} :: ${message}`);
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
  return String(value || "").split("*/").join("* /");
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
