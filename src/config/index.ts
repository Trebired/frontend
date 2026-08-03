import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type TrebiredFrontendIconPack = "remixicon" | "simple-icons";

type TrebiredFrontendSystemKey =
  | "actions"
  | "flash"
  | "fullscreen"
  | "icons"
  | "inputs"
  | "layer"
  | "modal"
  | "popover"
  | "progress"
  | "theme"
  | "tooltip";

type TrebiredFrontendThemeTokens = Record<string, unknown>;

type TrebiredFrontendConfig = {
  prefix?: string;
  icons?: {
    endpoint?: string;
    packs?: readonly TrebiredFrontendIconPack[];
  };
  systems?: Partial<Record<TrebiredFrontendSystemKey, boolean>>;
  theme?: {
    cssVariables?: boolean;
    tokens?: TrebiredFrontendThemeTokens;
  };
};

type NormalizedTrebiredFrontendConfig = {
  prefix: string;
  icons: {
    endpoint: string;
    packs: TrebiredFrontendIconPack[];
  };
  systems: Record<TrebiredFrontendSystemKey, boolean>;
  theme: {
    cssVariables: boolean;
    tokens: TrebiredFrontendThemeTokens;
  };
};

type LoadedTrebiredFrontendConfig = {
  config: NormalizedTrebiredFrontendConfig;
  configPath: string | null;
  generatedScss: string;
};

type LoadTrebiredFrontendConfigOptions = {
  configPath?: string;
  defaultIfMissing?: boolean;
  searchFrom?: string;
};

const TREBIRED_FRONTEND_CONFIG_PATH = ".trebired/frontend/config.ts";

const SUPPORTED_ICON_PACKS: TrebiredFrontendIconPack[] = ["remixicon", "simple-icons"];

const SYSTEM_ORDER: TrebiredFrontendSystemKey[] = [
  "theme",
  "layer",
  "icons",
  "progress",
  "flash",
  "tooltip",
  "popover",
  "modal",
  "inputs",
  "actions",
  "fullscreen",
];

const SYSTEM_STYLE_IMPORTS: Partial<Record<TrebiredFrontendSystemKey, string>> = {
  actions: "@trebired/frontend/actions/styles",
  flash: "@trebired/frontend/flash/styles",
  icons: "@trebired/frontend/icons/styles",
  inputs: "@trebired/frontend/inputs/styles",
  layer: "@trebired/frontend/layer/styles",
  modal: "@trebired/frontend/modal/styles",
  popover: "@trebired/frontend/popover/styles",
  progress: "@trebired/frontend/progress/styles",
  tooltip: "@trebired/frontend/tooltip/styles",
};

const DEFAULT_TREBIRED_FRONTEND_CONFIG: NormalizedTrebiredFrontendConfig = Object.freeze({
  prefix: "tbf",
  icons: Object.freeze({
    endpoint: "/__icons/svg",
    packs: Object.freeze([...SUPPORTED_ICON_PACKS]) as TrebiredFrontendIconPack[],
  }),
  systems: Object.freeze(Object.fromEntries(SYSTEM_ORDER.map((key) => [key, true]))) as Record<TrebiredFrontendSystemKey, boolean>,
  theme: Object.freeze({
    cssVariables: true,
    tokens: Object.freeze({}),
  }),
});

function defineTrebiredFrontendConfig<T extends TrebiredFrontendConfig>(config: T): T {
  return config;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function assertPlainObject(value: unknown, pathLabel: string): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error(`trebired-frontend-invalid-config :: ${pathLabel} must be an object`);
  }
  return value;
}

function normalizePrefix(value: unknown): string {
  const prefix = String(value || DEFAULT_TREBIRED_FRONTEND_CONFIG.prefix).trim();
  if (!/^[a-z][a-z0-9_-]*$/iu.test(prefix)) {
    throw new Error("trebired-frontend-invalid-config :: prefix must start with a letter and contain only letters, numbers, underscores, or hyphens");
  }
  return prefix;
}

function normalizeEndpoint(value: unknown): string {
  const endpoint = String(value || DEFAULT_TREBIRED_FRONTEND_CONFIG.icons.endpoint).trim();
  if (!endpoint || /[\s"'<>]/u.test(endpoint)) {
    throw new Error("trebired-frontend-invalid-config :: icons.endpoint must be a URL path without whitespace");
  }
  return endpoint;
}

function normalizeIconPacks(value: unknown): TrebiredFrontendIconPack[] {
  const raw = value === undefined ? DEFAULT_TREBIRED_FRONTEND_CONFIG.icons.packs : value;
  if (!Array.isArray(raw)) {
    throw new Error("trebired-frontend-invalid-config :: icons.packs must be an array");
  }
  const packs: TrebiredFrontendIconPack[] = [];
  for (const item of raw) {
    if (!SUPPORTED_ICON_PACKS.includes(item as TrebiredFrontendIconPack)) {
      throw new Error(`trebired-frontend-invalid-config :: unsupported icon pack ${String(item)}`);
    }
    if (!packs.includes(item as TrebiredFrontendIconPack)) packs.push(item as TrebiredFrontendIconPack);
  }
  return packs;
}

function normalizeSystems(value: unknown): Record<TrebiredFrontendSystemKey, boolean> {
  if (value === undefined) return { ...DEFAULT_TREBIRED_FRONTEND_CONFIG.systems };
  const source = assertPlainObject(value, "systems");
  const systems = { ...DEFAULT_TREBIRED_FRONTEND_CONFIG.systems };
  for (const [key, enabled] of Object.entries(source)) {
    if (!SYSTEM_ORDER.includes(key as TrebiredFrontendSystemKey)) {
      throw new Error(`trebired-frontend-invalid-config :: unsupported system ${key}`);
    }
    if (typeof enabled !== "boolean") {
      throw new Error(`trebired-frontend-invalid-config :: systems.${key} must be boolean`);
    }
    systems[key as TrebiredFrontendSystemKey] = enabled;
  }
  return systems;
}

function normalizeThemeTokens(value: unknown, pathLabel = "theme.tokens"): TrebiredFrontendThemeTokens {
  if (value === undefined) return {};
  const source = assertPlainObject(value, pathLabel);
  const out: TrebiredFrontendThemeTokens = {};
  for (const [key, item] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    if (!/^[a-z0-9_-]+$/iu.test(key)) {
      throw new Error(`trebired-frontend-invalid-config :: ${pathLabel}.${key} has an invalid token key`);
    }
    if (isPlainObject(item)) {
      out[key] = normalizeThemeTokens(item, `${pathLabel}.${key}`);
      continue;
    }
    if (typeof item !== "string" && typeof item !== "number") {
      throw new Error(`trebired-frontend-invalid-config :: ${pathLabel}.${key} must be a string, number, or token object`);
    }
    out[key] = item;
  }
  return out;
}

function normalizeBoolean(value: unknown, defaultValue: boolean, pathLabel: string): boolean {
  if (value === undefined) return defaultValue;
  if (typeof value !== "boolean") {
    throw new Error(`trebired-frontend-invalid-config :: ${pathLabel} must be boolean`);
  }
  return value;
}

function normalizeTrebiredFrontendConfig(config: unknown = {}): NormalizedTrebiredFrontendConfig {
  const source = assertPlainObject(config, "config");
  const icons = source.icons === undefined ? {} : assertPlainObject(source.icons, "icons");
  const theme = source.theme === undefined ? {} : assertPlainObject(source.theme, "theme");
  return {
    prefix: normalizePrefix(source.prefix),
    icons: {
      endpoint: normalizeEndpoint(icons.endpoint),
      packs: normalizeIconPacks(icons.packs),
    },
    systems: normalizeSystems(source.systems),
    theme: {
      cssVariables: normalizeBoolean(theme.cssVariables, true, "theme.cssVariables"),
      tokens: normalizeThemeTokens(theme.tokens),
    },
  };
}

function cssString(value: unknown): string {
  return JSON.stringify(String(value ?? ""));
}

function cssComment(value: unknown): string {
  return String(value || "").replace(/\*\//gu, "* /");
}

function flattenThemeTokens(
  tokens: TrebiredFrontendThemeTokens,
  prefix: string[] = [],
): Array<[string, string | number]> {
  const out: Array<[string, string | number]> = [];
  for (const [key, value] of Object.entries(tokens).sort(([a], [b]) => a.localeCompare(b))) {
    if (isPlainObject(value)) {
      out.push(...flattenThemeTokens(value, [...prefix, key]));
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      out.push([[...prefix, key].join("-"), value]);
    }
  }
  return out;
}

function renderCssVariables(config: NormalizedTrebiredFrontendConfig): string[] {
  if (!config.theme.cssVariables) return [];
  const declarations = [
    `  --${config.prefix}-config-prefix: ${cssString(config.prefix)};`,
    `  --${config.prefix}-icon-endpoint: ${cssString(config.icons.endpoint)};`,
    ...flattenThemeTokens(config.theme.tokens).map(([key, value]) => {
      return `  --${config.prefix}-${key}: ${String(value)};`;
    }),
  ];
  return [
    ":root {",
    ...declarations,
    "}",
  ];
}

function generateTrebiredFrontendScss(configInput: TrebiredFrontendConfig | NormalizedTrebiredFrontendConfig): string {
  const config = normalizeTrebiredFrontendConfig(configInput);
  const lines = [
    "/* Generated by @trebired/frontend. Do not edit directly. */",
    `/* prefix: ${cssComment(config.prefix)} */`,
    '@use "@trebired/frontend/styles/tokens" as *;',
    '@use "@trebired/frontend/styles/utils" as *;',
  ];

  for (const system of SYSTEM_ORDER) {
    const importPath = SYSTEM_STYLE_IMPORTS[system];
    if (importPath && config.systems[system]) {
      lines.push(`@use ${cssString(importPath)} as *;`);
    }
  }

  const variables = renderCssVariables(config);
  if (variables.length) {
    lines.push("", ...variables);
  }

  return `${lines.join("\n")}\n`;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findTrebiredFrontendConfig(
  startDir: string = process.cwd(),
  boundaryDir?: string,
): Promise<string | null> {
  const boundary = path.resolve(boundaryDir || path.parse(path.resolve(startDir)).root);
  let current = path.resolve(startDir);
  for (;;) {
    const candidate = path.join(current, TREBIRED_FRONTEND_CONFIG_PATH);
    if (await pathExists(candidate)) return candidate;
    if (current === boundary || current === path.dirname(current)) return null;
    current = path.dirname(current);
  }
}

function createConfigBuildHash(filePath: string, sourceText: string): string {
  return crypto.createHash("sha256")
    .update(path.resolve(filePath))
    .update("\0")
    .update(sourceText)
    .digest("hex")
    .slice(0, 16);
}

async function buildConfigModuleToUrl(projectRoot: string, filePath: string): Promise<string> {
  if (typeof Bun === "undefined" || typeof Bun.build !== "function") {
    const url = pathToFileURL(filePath);
    url.searchParams.set("mtime", String((await fs.stat(filePath)).mtimeMs));
    return url.href;
  }

  const sourceText = await fs.readFile(filePath, "utf8");
  const digest = createConfigBuildHash(filePath, sourceText);
  const outputDir = path.join(projectRoot, "node_modules", ".cache", "trebired-frontend", "config", digest);
  const basename = path.basename(filePath, path.extname(filePath)).replace(/[^\w.-]/gu, "_") || "config";
  const outputPath = path.join(outputDir, `${basename}.js`);

  if (!await pathExists(outputPath)) {
    await fs.mkdir(outputDir, { recursive: true });
    const result = await Bun.build({
      entrypoints: [filePath],
      external: ["@trebired/frontend", "@trebired/frontend/*"],
      format: "esm",
      naming: `${basename}.js`,
      outdir: outputDir,
      packages: "external",
      target: "bun",
    });

    if (!result.success) {
      const message = result.logs.map((log) => log.message).filter(Boolean).join("\n");
      throw new Error(`trebired-frontend-invalid-config :: failed to compile ${filePath}${message ? `\n${message}` : ""}`);
    }
  }

  return pathToFileURL(outputPath).href;
}

async function importConfigModule(projectRoot: string, filePath: string): Promise<unknown> {
  const imported = await import(await buildConfigModuleToUrl(projectRoot, filePath));
  return imported.default;
}

async function loadTrebiredFrontendConfig(
  projectRoot: string = process.cwd(),
  options: LoadTrebiredFrontendConfigOptions = {},
): Promise<LoadedTrebiredFrontendConfig> {
  const root = path.resolve(projectRoot);
  const resolvedPath = options.configPath
    ? path.resolve(root, options.configPath)
    : await findTrebiredFrontendConfig(options.searchFrom || root);

  if (!resolvedPath) {
    if (options.defaultIfMissing === false) {
      throw new Error(`trebired-frontend-config-not-found :: ${TREBIRED_FRONTEND_CONFIG_PATH}`);
    }
    const config = normalizeTrebiredFrontendConfig({});
    return {
      config,
      configPath: null,
      generatedScss: generateTrebiredFrontendScss(config),
    };
  }

  if (!await pathExists(resolvedPath)) {
    throw new Error(`trebired-frontend-config-not-found :: ${resolvedPath}`);
  }

  const config = normalizeTrebiredFrontendConfig(await importConfigModule(root, resolvedPath));
  return {
    config,
    configPath: resolvedPath,
    generatedScss: generateTrebiredFrontendScss(config),
  };
}

export {
  DEFAULT_TREBIRED_FRONTEND_CONFIG,
  SUPPORTED_ICON_PACKS,
  SYSTEM_ORDER,
  TREBIRED_FRONTEND_CONFIG_PATH,
  defineTrebiredFrontendConfig,
  findTrebiredFrontendConfig,
  generateTrebiredFrontendScss,
  loadTrebiredFrontendConfig,
  normalizeTrebiredFrontendConfig,
};
export type {
  LoadedTrebiredFrontendConfig,
  LoadTrebiredFrontendConfigOptions,
  NormalizedTrebiredFrontendConfig,
  TrebiredFrontendConfig,
  TrebiredFrontendIconPack,
  TrebiredFrontendSystemKey,
  TrebiredFrontendThemeTokens,
};
