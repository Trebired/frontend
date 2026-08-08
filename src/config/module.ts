import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { invalidConfig } from "./shared.js";

const CONFIG_DEPENDENCY_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs", ".json"];
const IMPORT_FROM_RE = /\bimport\s+(?:type\s+)?(?:[\w*\s{},]+?)\s+from\s+["']([^"']+)["']/gu;
const IMPORT_SIDE_EFFECT_RE = /\bimport\s+["']([^"']+)["']/gu;
const EXPORT_FROM_RE = /\bexport\s+(?:type\s+)?(?:[\w*\s{},]+?)\s+from\s+["']([^"']+)["']/gu;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/gu;
const RELATIVE_SPECIFIER_PATTERNS = [IMPORT_FROM_RE, IMPORT_SIDE_EFFECT_RE, EXPORT_FROM_RE, DYNAMIC_IMPORT_RE];

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function collectRelativeSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  for (const pattern of RELATIVE_SPECIFIER_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(source))) {
      const specifier = String(match[1] || "").trim();
      if (specifier.startsWith("./") || specifier.startsWith("../")) specifiers.add(specifier);
    }
  }
  return [...specifiers];
}

async function resolveDependencyPath(fromFile: string, specifier: string): Promise<string> {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const withoutJsExtension = base.replace(/\.(js|jsx|mjs|cjs)$/u, "");
  const candidates = [
    base,
    ...CONFIG_DEPENDENCY_EXTENSIONS.map((extension) => `${withoutJsExtension}${extension}`),
    ...CONFIG_DEPENDENCY_EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return path.resolve(candidate);
  }
  return "";
}

async function collectConfigDependencies(entryPath: string): Promise<string[]> {
  const visited = new Set<string>();
  const pending = [path.resolve(entryPath)];
  while (pending.length) {
    const current = pending.pop()!;
    if (visited.has(current) || !await isFile(current)) continue;
    visited.add(current);
    if (current.endsWith(".json")) continue;
    const source = await fs.readFile(current, "utf8");
    for (const specifier of collectRelativeSpecifiers(source)) {
      const resolved = await resolveDependencyPath(current, specifier);
      if (resolved && !visited.has(resolved)) pending.push(resolved);
    }
  }
  return [...visited].sort((a, b) => a.localeCompare(b));
}

async function createConfigBuildHash(dependencies: string[]): Promise<string> {
  const hash = crypto.createHash("sha256");
  for (const dependency of dependencies) {
    hash.update(path.resolve(dependency)).update("\0").update(await fs.readFile(dependency, "utf8")).update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}

async function buildConfigModuleToUrl(
  projectRoot: string,
  filePath: string,
  dependencies: string[],
): Promise<string> {
  if (typeof Bun === "undefined" || typeof Bun.build !== "function") {
    const url = pathToFileURL(filePath);
    url.searchParams.set("mtime", String(await newestDependencyMtime(dependencies)));
    return url.href;
  }

  const digest = await createConfigBuildHash(dependencies);
  const outputDir = path.join(projectRoot, "node_modules", ".cache", "trebired-frontend", "config", digest);
  const basename = path.basename(filePath, path.extname(filePath)).replace(/[^\w.-]/gu, "_") || "config";
  const outputPath = path.join(outputDir, `${basename}.js`);

  if (!await pathExists(outputPath)) {
    await fs.mkdir(outputDir, { recursive: true });
    const result = await Bun.build({
      entrypoints: [filePath],
      external: ["@trebired/frontend", "@trebired/frontend/config"],
      format: "esm",
      naming: `${basename}.js`,
      outdir: outputDir,
      packages: "external",
      target: "bun",
    });

    if (!result.success) {
      const message = result.logs.map((log) => log.message).filter(Boolean).join("\n");
      throw invalidConfig(`failed to compile ${filePath}${message ? `\n${message}` : ""}`);
    }
  }

  return pathToFileURL(outputPath).href;
}

async function newestDependencyMtime(dependencies: string[]): Promise<number> {
  let newest = 0;
  for (const dependency of dependencies) {
    const stats = await fs.stat(dependency);
    if (stats.mtimeMs > newest) newest = stats.mtimeMs;
  }
  return newest;
}

async function importConfigModule(
  projectRoot: string,
  filePath: string,
  dependencies: string[],
): Promise<unknown> {
  const imported = await import(await buildConfigModuleToUrl(projectRoot, filePath, dependencies));
  return imported.default;
}

export { collectConfigDependencies, importConfigModule, pathExists };
