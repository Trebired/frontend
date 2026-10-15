import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { breakpointEntries } from "./breakpoints.js";
import { invalidConfig } from "./shared.js";
import type {
  FrontendContainerDefinition,
  FrontendContainerStyle,
  NormalizedFrontendConfig,
  NormalizedFrontendContainers,
} from "./types.js";

const NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const PROPERTY_PATTERN = /^-{0,2}[a-zA-Z][a-zA-Z0-9-]*$/u;
const DEFINITION_FIELDS = ["at", "on", "parts", "style", "variants"];

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
    if (typeof declared !== "string" && typeof declared !== "number") {
      throw invalidConfig(`${label}.${property} must be a string or a number`);
    }
    style[cssProperty(property, `${label}.${property}`)] = String(declared);
  }
  return style;
}

function normalizeName(name: string, label: string): string {
  if (!NAME_PATTERN.test(name)) {
    throw invalidConfig(`${label} must be kebab-case :: ${name}`);
  }
  if (name.startsWith(`${FRONTEND_PREFIX}-`)) {
    throw invalidConfig(`${label} may not start with ${FRONTEND_PREFIX}-, that prefix is the package's :: ${name}`);
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
    on: normalizeStyleMap(value.on, `${label}.on`),
    parts: {},
    style: value.style === undefined ? {} : normalizeStyle(value.style, `${label}.style`),
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
  const lines = [...ruleFor(selector, definition.style)];
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
    lines.push(...renderDefinition(`.${name}`, definition, breakpoints));
    for (const [part, nested] of Object.entries(definition.parts)) {
      lines.push(...renderDefinition(`.${name}__${part}`, nested, breakpoints));
    }
    for (const [variant, nested] of Object.entries(definition.variants)) {
      lines.push(...renderDefinition(`.${name}--${variant}`, nested, breakpoints));
    }
  }
  return lines;
}

export { normalizeContainersConfig, renderContainerClassRules };
