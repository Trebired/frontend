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
  const exports = Object.keys(packageJson.exports || {});
  const imports = exports
    .filter((subpath) => subpath !== "./styles.css")
    .map((subpath) => {
      const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
      return `await import(${JSON.stringify(specifier)});`;
    })
    .join("\n");
  const checkFile = path.join(packageRoot, "check.mjs");
  await fs.writeFile(checkFile, imports);
  execFileSync("bun", [checkFile], {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  await fs.access(path.join(packageRoot, "node_modules", packageJson.name, "dist", "styles.css"));
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
