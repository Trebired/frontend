import fs from "node:fs/promises";
import path from "node:path";

const metadataCache = new Map();

async function packageMetadata(rootDir) {
  const key = path.resolve(rootDir);
  const cached = metadataCache.get(key);
  if (cached) return cached;
  const metadata = JSON.parse(await fs.readFile(path.join(key, "package.json"), "utf8"));
  metadataCache.set(key, metadata);
  return metadata;
}

async function packageName(rootDir) {
  const name = String((await packageMetadata(rootDir)).name || "").trim();
  if (!name) throw new Error("missing-package-name");
  return name;
}

async function organizationName(rootDir) {
  const metadata = await packageMetadata(rootDir);
  const configured = String(metadata.config?.organization?.name || "").trim();
  if (configured) return configured;
  const match = /^@([^/]+)\//u.exec(await packageName(rootDir));
  if (match?.[1]) return match[1];
  throw new Error("missing-package-organization");
}

async function siblingPackageName(rootDir, siblingName) {
  return (await packageName(rootDir)).replace(/\/[^/]+$/u, `/${siblingName}`);
}

async function workspaceConfigDir(rootDir) {
  return `.${await organizationName(rootDir)}`;
}

export {
  organizationName,
  packageMetadata,
  packageName,
  siblingPackageName,
  workspaceConfigDir,
};
