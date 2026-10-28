import { FRONTEND_CONTAINER_PREFIX, FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { breakpointEntries } from "./breakpoints.js";
import { invalidConfig, isCssToken } from "./shared.js";
import type {
  FrontendContainerDefinition,
  FrontendContainersConfig,
  FrontendContainerTone,
  FrontendContainerStyle,
  NormalizedFrontendConfig,
  NormalizedFrontendContainers,
} from "./types.js";

const NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const PROPERTY_PATTERN = /^-{0,2}[a-zA-Z][a-zA-Z0-9-]*$/u;
const DEFINITION_FIELDS = ["at", "frost", "on", "parts", "style", "tone", "variants"];
const TONES = ["dark", "light"];
const TONE_NAMESPACE = "tone";
const FROST_NAMESPACE = "frost";
const FROST_TEXT = ":where(p, li:not([class]), blockquote, figcaption, dd):not(:where(li, blockquote, figcaption, dd) *)";
const RAW_TOKEN_PATTERN = new RegExp(`var\\(\\s*--${FRONTEND_PREFIX}-`, "u");

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cssProperty(property: string, label: string): string {
  if (!PROPERTY_PATTERN.test(property)) {
    throw invalidConfig(`${label} is not a css property name :: ${property}`);
  }
  if (property.startsWith("--")) return property;
  return property.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function normalizeStyle(value: unknown, label: string): FrontendContainerStyle {
  if (!isPlainRecord(value)) {
    throw invalidConfig(`${label} must be an object of css declarations`);
  }
  const style: FrontendContainerStyle = {};
  for (const [property, declared] of Object.entries(value)) {
    if (declared === undefined || declared === null) continue;
    const token = isCssToken(declared);
    if (!token && typeof declared !== "string" && typeof declared !== "number") {
      throw invalidConfig(`${label}.${property} must be a string, a number or a config token`);
    }
    if (!token && typeof declared === "string" && RAW_TOKEN_PATTERN.test(declared)) {
      throw invalidConfig(
        `${label}.${property} writes a package token by hand :: ${declared}`
        +` :: read it with the config token helpers, or compose it with token.css`,
      );
    }
    style[cssProperty(property, `${label}.${property}`)] = String(declared);
  }
  return style;
}

function normalizeName(name: string, label: string): string {
  if (!NAME_PATTERN.test(name)) {
    throw invalidConfig(`${label} must be kebab-case :: ${name}`);
  }
  for (const reserved of [FRONTEND_PREFIX, FRONTEND_CONTAINER_PREFIX]) {
    if (!name.startsWith(`${reserved}-`)) continue;
    throw invalidConfig(
      `${label} may not start with ${reserved}-, the package writes that prefix itself :: ${name}`,
    );
  }
  return name;
}

function normalizeStyleMap(
  value: unknown,
  label: string,
  known?: readonly string[],
): Record<string, FrontendContainerStyle> {
  if (value === undefined) return {};
  if (!isPlainRecord(value)) throw invalidConfig(`${label} must be an object`);
  const out: Record<string, FrontendContainerStyle> = {};
  for (const [key, declared] of Object.entries(value)) {
    const name = key.trim();
    if (!name) throw invalidConfig(`${label} has an empty key`);
    if (known && !known.includes(name)) {
      throw invalidConfig(`${label}.${name} is not a declared breakpoint, expected ${known.join(", ")}`);
    }
    out[name] = normalizeStyle(declared, `${label}.${key}`);
  }
  return out;
}

function normalizeTone(value: unknown, label: string): FrontendContainerTone {
  if (value === undefined) return null;
  if (typeof value !== "string" || !TONES.includes(value)) {
    throw invalidConfig(`${label} must be one of ${TONES.join(", ")}`);
  }
  return value as FrontendContainerTone;
}

function normalizeFrost(value: unknown, label: string): boolean {
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw invalidConfig(`${label} must be true or false`);
  return value;
}

function frostRule(selector: string, frost: boolean): string[] {
  return frost ? [`:where(${selector}) ${FROST_TEXT} {`, `  @include ${FROST_NAMESPACE}.text;`, "}"] : [];
}

function toneDeclarations(tone: FrontendContainerTone): string[] {
  return tone ? [`  @include ${TONE_NAMESPACE}.on-${tone};`] : [];
}

function normalizeDefinition(
  value: unknown,
  label: string,
  nested: boolean,
  breakpoints: readonly string[],
): FrontendContainerDefinition {
  if (!isPlainRecord(value)) throw invalidConfig(`${label} must be an object`);
  for (const field of Object.keys(value)) {
    if (!DEFINITION_FIELDS.includes(field)) {
      throw invalidConfig(`${label}.${field} is not a container field, expected ${DEFINITION_FIELDS.join(", ")}`);
    }
    if (nested && (field === "parts" || field === "variants")) {
      throw invalidConfig(`${label}.${field} may only be declared on a container itself`);
    }
  }

  const definition: FrontendContainerDefinition = {
    at: normalizeStyleMap(value.at, `${label}.at`, breakpoints),
    frost: normalizeFrost(value.frost, `${label}.frost`),
    on: normalizeStyleMap(value.on, `${label}.on`),
    parts: {},
    style: value.style === undefined ? {} : normalizeStyle(value.style, `${label}.style`),
    tone: normalizeTone(value.tone, `${label}.tone`),
    variants: {},
  };

  if (nested) return definition;

  for (const [part, declared] of Object.entries(isPlainRecord(value.parts) ? value.parts : {})) {
    const name = normalizeName(part, `${label}.parts.${part}`);
    definition.parts[name] = normalizeDefinition(declared, `${label}.parts.${part}`, true, breakpoints);
  }
  for (const [variant, declared] of Object.entries(isPlainRecord(value.variants) ? value.variants : {})) {
    const name = normalizeName(variant, `${label}.variants.${variant}`);
    definition.variants[name] = normalizeDefinition(declared, `${label}.variants.${variant}`, true, breakpoints);
  }
  return definition;
}

function defineContainers<const T extends FrontendContainersConfig>(containers: T): T {
  return containers;
}

function normalizeContainersConfig(
  value: unknown,
  breakpoints: readonly string[],
): NormalizedFrontendContainers {
  if (value === undefined) return {};
  if (!isPlainRecord(value)) throw invalidConfig("containers must be an object");
  const containers: NormalizedFrontendContainers = {};
  for (const [rawName, declared] of Object.entries(value)) {
    const name = normalizeName(rawName, `containers.${rawName}`);
    containers[name] = normalizeDefinition(declared, `containers.${rawName}`, false, breakpoints);
  }
  return containers;
}

function declarations(style: FrontendContainerStyle): string[] {
  return Object.entries(style).map(([property, value]) => `  ${property}: ${value};`);
}

function ruleFor(selector: string, style: FrontendContainerStyle): string[] {
  const body = declarations(style);
  return body.length ? [`${selector} {`, ...body, "}"] : [];
}

function stateSelector(selector: string, state: string): string {
  if (state.startsWith("&")) return `${selector}${state.slice(1)}`;
  if (state.startsWith("[") || state.startsWith(":")) return `${selector}${state}`;
  return `${selector}:${state}`;
}

function renderDefinition(
  selector: string,
  definition: FrontendContainerDefinition,
  breakpoints: Record<string, number>,
): string[] {
  const tone = toneDeclarations(definition.tone);
  const body = [...tone, ...declarations(definition.style)];
  const lines = body.length ? [`${selector} {`, ...body, "}"] : [];
  lines.push(...frostRule(selector, definition.frost));
  for (const [state, style] of Object.entries(definition.on)) {
    lines.push(...ruleFor(stateSelector(selector, state), style));
  }
  for (const [name] of breakpointEntries(breakpoints)) {
    const style = definition.at[name];
    if (!style) continue;
    const body = ruleFor(selector, style);
    if (!body.length) continue;
    lines.push(
      `@media (max-width: ${breakpoints[name]}px) {`,
      ...body.map((line) => `  ${line}`),
      "}",
    );
  }
  return lines;
}

function renderContainerClassRules(config: NormalizedFrontendConfig): string[] {
  const breakpoints = config.design.breakpoints;
  const lines: string[] = [];
  for (const [name, definition] of Object.entries(config.containers)) {
    const selector = `.${FRONTEND_CONTAINER_PREFIX}-${name}`;
    lines.push(...renderDefinition(selector, definition, breakpoints));
    for (const [part, nested] of Object.entries(definition.parts)) {
      lines.push(...renderDefinition(`${selector}__${part}`, nested, breakpoints));
    }
    for (const [variant, nested] of Object.entries(definition.variants)) {
      lines.push(...renderDefinition(`${selector}--${variant}`, nested, breakpoints));
    }
  }
  return lines;
}

export { FROST_NAMESPACE, TONE_NAMESPACE, defineContainers, normalizeContainersConfig, renderContainerClassRules };
