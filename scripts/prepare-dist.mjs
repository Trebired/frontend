import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceConfigDir } from "./package-meta.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

async function main() {
  const aliasTargets = await readAliasMap(
    path.join(rootDir, await workspaceConfigDir(rootDir), "code-discipline", "imports"),
  );
  await promotePublicDistFiles();
  await copyScssFiles();
  await copyVendorScssFiles();
  await rewriteDistAliases(aliasTargets);
}

async function readAliasMap(aliasMapDir) {
  const aliases = {};

  try {
    const entries = await fs.readdir(aliasMapDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(aliasMapDir, entry.name), "utf8");
      Object.assign(aliases, JSON.parse(raw));
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  return aliases;
}

async function promotePublicDistFiles() {
  await fs.cp(path.join(distDir, "src"), distDir, {
    force: true,
    recursive: true,
  });
}

async function rewriteDistAliases(aliasTargets) {
  const files = await collectDistFiles(distDir);
  await Promise.all(files.map(async (filePath) => {
    const kind = filePath.endsWith(".d.ts")
      ? "types"
      : filePath.endsWith(".scss")
        ? "scss"
        : "runtime";
    const original = await fs.readFile(filePath, "utf8");
    const rewritten = rewriteAliasImports(original, filePath, aliasTargets, kind);
    if (rewritten !== original) await fs.writeFile(filePath, rewritten);
  }));
}

async function collectDistFiles(startDir) {
  const files = [];
  const stack = [startDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(nextPath);
        continue;
      }
      if (
        entry.isFile() &&
        (nextPath.endsWith(".js") ||
          nextPath.endsWith(".d.ts") ||
          nextPath.endsWith(".scss"))
      ) {
        files.push(nextPath);
      }
    }
  }

  return files;
}

function rewriteAliasImports(source, filePath, aliasTargets, kind) {
  return source.replace(/(["'])(#[^"']+)\1/g, (match, quote, alias) => {
    const target = aliasTargets[alias];
    if (!target) return match;

    const compiledPath = resolveCompiledTarget(target, kind);
    if (!compiledPath) return match;

    const relativePath = toRelativeImport(path.relative(path.dirname(filePath), compiledPath));
    return `${quote}${relativePath}${quote}`;
  });
}

function resolveCompiledTarget(target, kind) {
  const normalized = normalizePath(target);
  if (!normalized.startsWith("src/")) return undefined;

  const relativeTarget = normalized.replace(/^src\//u, "");
  const compiledRelative = kind === "scss"
    ? relativeTarget
    : relativeTarget.replace(/\.(ts|tsx|js|jsx)$/u, kind === "types" ? ".d.ts" : ".js");
  return path.join(distDir, compiledRelative);
}

function toRelativeImport(value) {
  const normalized = normalizePath(value);
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}

function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/^\.\//u, "");
}

async function copyScssFiles() {
  const files = await collectSourceScssFiles(path.join(rootDir, "src"));
  await Promise.all(files.map(async (filePath) => {
    const relative = normalizePath(path.relative(path.join(rootDir, "src"), filePath));
    const target = path.join(distDir, relative);
    const source = await fs.readFile(filePath, "utf8");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, rewriteVendorScssImports(source));
  }));
}

function rewriteVendorScssImports(source) {
  return source.replace(
    /@use\s+["']country-flag-icons\/3x2\/flags["'];/u,
    '@use "../../vendor/country-flag-icons/3x2/flags";',
  );
}

async function copyVendorScssFiles() {
  await copyVendorCssAsScss(
    path.join(rootDir, "node_modules", "country-flag-icons", "3x2", "flags.css"),
    path.join(distDir, "vendor", "country-flag-icons", "3x2", "flags.scss"),
  );
}

async function copyVendorCssAsScss(source, target) {
  const css = await fs.readFile(source, "utf8");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, css);
}

async function collectSourceScssFiles(startDir) {
  const files = [];
  const stack = [startDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(nextPath);
      else if (entry.isFile() && entry.name.endsWith(".scss")) files.push(nextPath);
    }
  }
  return files;
}

await main();
