import fs from "node:fs/promises";
import path from "node:path";

const metadataCache = new Map();

async function readWorkspacePackageMetadata(rootDir) {
  const key = path.resolve(rootDir);
  const cached = metadataCache.get(key);
  if (cached) return cached;
  const metadata = JSON.parse(await fs.readFile(path.join(key, "package.json"), "utf8"));
  metadataCache.set(key, metadata);
  return metadata;
}

async function packageName(rootDir) {
  const name = String((await readWorkspacePackageMetadata(rootDir)).name || "").trim();
  if (!name) throw new Error("missing-package-name");
  return name;
}

async function readWorkspaceOrganizationName(rootDir) {
  const metadata = await readWorkspacePackageMetadata(rootDir);
  const configured = String(metadata.config?.organization?.name || "").trim();
  if (configured) return configured;
  const name = await packageName(rootDir);
  const slashIndex = name.indexOf("/");
  if (name.startsWith("@") && slashIndex > 1) return name.slice(1, slashIndex);
  throw new Error("missing-package-organization");
}

async function siblingPackageName(rootDir, siblingName) {
  return (await packageName(rootDir)).replace(/\/[^/]+$/u, `/${siblingName}`);
}

async function workspaceConfigDir(rootDir) {
  return `.${await readWorkspaceOrganizationName(rootDir)}`;
}

export {
  readWorkspaceOrganizationName as organizationName,
  readWorkspacePackageMetadata as packageMetadata,
  packageName,
  siblingPackageName,
  workspaceConfigDir,
};
