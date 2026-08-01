import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tempRoot = path.join(rootDir, ".tmp", "verify-pack");
const packageRoot = path.join(tempRoot, "consumer");

async function main() {
  await resetTempRoot();
  const tarballPath = packPackage();
  try {
    const packageJson = readPackedPackageJson(tarballPath);
    const tarballEntries = listTarEntries(tarballPath);
    validatePackedEntrypoints(packageJson, tarballEntries);
    await validatePackedImports(packageJson, tarballPath);
  } finally {
    await fs.rm(tarballPath, { force: true });
  }
  console.log("Pack verification succeeded.");
}

async function resetTempRoot() {
  await fs.rm(tempRoot, { force: true, recursive: true });
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.writeFile(
    path.join(packageRoot, "package.json"),
    JSON.stringify({ dependencies: {}, type: "module" }, null, 2),
  );
}

function packPackage() {
  const stdout = execFileSync(
    "bun",
    ["pm", "pack", "--quiet", "--destination", tempRoot],
    {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    },
  ).trim();
  const filename = stdout.split("\n").map((line) => line.trim()).filter(Boolean).pop();
  if (!filename) throw new Error("bun pm pack did not return a tarball filename.");
  return path.isAbsolute(filename) ? filename : path.join(tempRoot, filename);
}

function validatePackedEntrypoints(packageJson, tarballEntries) {
  const targets = new Set([packageJson.main, packageJson.types]);
  for (const value of Object.values(packageJson.exports || {})) {
    collectExportTargets(value, targets);
  }
  for (const target of targets) {
    if (typeof target !== "string") continue;
    assertTarEntryExists(tarballEntries, target, `Missing packed target: ${target}`);
    assert.equal(target.includes("./src/"), false, `Packed target points at source: ${target}`);
  }
}

async function validatePackedImports(packageJson, tarballPath) {
  execFileSync("bun", ["add", tarballPath], {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  execFileSync("bun", ["add", "react@^19.2.0", "react-dom@^19.2.0"], {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  assert.equal(packageJson.exports["./styles.css"], undefined);
  const imports = runtimeExportSubpaths(packageJson)
    .map((subpath) => `await import(${JSON.stringify(exportSpecifier(packageJson.name, subpath))});`)
    .join("\n");
  const checkFile = path.join(packageRoot, "check.mjs");
  await fs.writeFile(checkFile, imports);
  execFileSync("bun", [checkFile], {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  await Promise.all(styleExportTargets(packageJson).map(async (target) => {
    await fs.access(path.join(packageRoot, "node_modules", packageJson.name, target));
  }));
}

function runtimeExportSubpaths(packageJson) {
  return Object.entries(packageJson.exports || {})
    .filter(([_subpath, value]) => typeof value?.import === "string")
    .map(([subpath]) => subpath);
}

function exportSpecifier(packageName, subpath) {
  return subpath === "." ? packageName : `${packageName}/${subpath.slice(2)}`;
}

function styleExportTargets(packageJson) {
  return Object.values(packageJson.exports || {})
    .flatMap((value) => [value?.sass, value?.style, value?.default])
    .filter((value, index, list) => typeof value === "string" && value.endsWith(".scss") && list.indexOf(value) === index)
    .map((value) => String(value).replace(/^\.\//u, ""));
}

function collectExportTargets(value, targets) {
  if (typeof value === "string") {
    targets.add(value);
    return;
  }
  for (const nested of Object.values(value || {})) collectExportTargets(nested, targets);
}

function assertTarEntryExists(tarballEntries, packagePath, message) {
  const entryPath = `package/${String(packagePath).replace(/^\.\//u, "")}`;
  assert.equal(tarballEntries.has(entryPath), true, message);
}

function listTarEntries(tarballPath) {
  return new Set(
    execFileSync("tar", ["-tf", tarballPath], { encoding: "utf8" })
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function readPackedPackageJson(tarballPath) {
  return JSON.parse(
    execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
}

await main();
