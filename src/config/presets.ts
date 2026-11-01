import path from "node:path";
import { createRequire } from "node:module";
import fs from "node:fs/promises";

import { resolveForVersion } from "@trebired/utils";
import { collectConfigDependencies, importConfigModule, pathExists } from "./module.js";
import { frontendConfigPath, PACKAGE_VERSION } from "./package.js";
import { invalidConfig, isPlainObject } from "./shared.js";
import type { FrontendConfig } from "./types.js";

type ConfigRecord = Record<string, unknown>;

type FrontendPresetsConfig = NonNullable<FrontendConfig["presets"]>;

type ResolvedFrontendPresets = {
  config: unknown;
  dependencies: string[];
};

const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/iu;

function presetNames(value: unknown): string[] {
  if (value === undefined) return [];
  if (!isPlainObject(value)) throw invalidConfig("presets must be an object");
  for (const key of Object.keys(value)) {
    if (key !== "use") throw invalidConfig(`presets.${key} is not supported`);
  }
  const entries = value.use === undefined ? [] : Array.isArray(value.use) ? value.use : [value.use];
  for (const entry of entries) {
    if (typeof entry !== "string" || !PACKAGE_NAME_PATTERN.test(entry)) {
      throw invalidConfig(`presets.use must name npm packages, found ${String(entry)}`);
    }
  }
  return [...new Set(entries as string[])];
}

async function packageNamed(dir: string, name: string): Promise<boolean> {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"));
    return manifest?.name === name;
  } catch {
    return false;
  }
}

async function presetPackageRoot(name: string, projectRoot: string): Promise<string> {
  const installed = path.join(projectRoot, "node_modules", ...name.split("/"));
  if (await packageNamed(installed, name)) return installed;
  try {
    let current = path.dirname(createRequire(path.join(projectRoot, "package.json")).resolve(name));
    while (current !== path.dirname(current)) {
      if (await packageNamed(current, name)) return current;
      current = path.dirname(current);
    }
  } catch {
  }
  throw invalidConfig(`preset package ${name} is not installed`);
}

function presetConfig(name: string, file: string, imported: unknown): ConfigRecord {
  if (!isPlainObject(imported)) throw invalidConfig(`preset ${name} must default-export a config object`);
  if ("presets"in imported) throw invalidConfig(`preset ${name} cannot declare presets`);
  resolveForVersion({
      config: imported,
      configPath: file,
      forVersion: imported.forVersion,
      label: `frontend preset ${name}`,
      packageVersion: PACKAGE_VERSION,
      requireForVersion: true,
  });
  const config = { ...imported };
  delete config.forVersion;
  return config;
}

function mergeConfig(base: ConfigRecord, override: ConfigRecord): ConfigRecord {
  const merged: ConfigRecord = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] = isPlainObject(current) && isPlainObject(value) ? mergeConfig(current, value) : value;
  }
  return merged;
}

async function loadPreset(name: string, projectRoot: string) {
  const file = path.join(await presetPackageRoot(name, projectRoot), frontendConfigPath());
  if (!await pathExists(file)) throw invalidConfig(`preset ${name} has no ${frontendConfigPath()}`);
  const dependencies = await collectConfigDependencies(file);
  const imported = await importConfigModule(projectRoot, file, dependencies);
  return { config: presetConfig(name, file, imported), dependencies };
}

async function applyFrontendPresets(config: unknown, projectRoot: string): Promise<ResolvedFrontendPresets> {
  if (!isPlainObject(config) || !("presets"in config)) return { config, dependencies: [] };
  const { forVersion, presets, ...own } = config;
  let merged: ConfigRecord = {};
  const dependencies: string[] = [];
  for (const name of presetNames(presets)) {
    const preset = await loadPreset(name, projectRoot);
    merged = mergeConfig(merged, preset.config);
    dependencies.push(...preset.dependencies);
  }
  return {
    config: { ...(forVersion === undefined ? {} : { forVersion }), ...mergeConfig(merged, own) },
    dependencies,
  };
}

export { applyFrontendPresets };
export type { FrontendPresetsConfig, ResolvedFrontendPresets };
