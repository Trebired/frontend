import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PackageMetadata = {
  config?: {
    organization?: {
      name?: string;
    };
  };
  name?: string;
};

let cachedMetadata: PackageMetadata | null = null;

function packageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

function packageMetadata(): PackageMetadata {
  if (cachedMetadata) return cachedMetadata;
  const raw = fs.readFileSync(path.join(packageRoot(), "package.json"), "utf8");
  cachedMetadata = JSON.parse(raw) as PackageMetadata;
  return cachedMetadata;
}

function frontendPackageName(): string {
  const name = String(packageMetadata().name || "").trim();
  if (!name) throw new Error("frontend-package-name-missing");
  return name;
}

function organizationName(): string {
  const metadata = packageMetadata();
  const configured = String(metadata.config?.organization?.name || "").trim();
  if (configured) return configured;
  const name = frontendPackageName();
  const slashIndex = name.indexOf("/");
  if (name.startsWith("@") && slashIndex > 1) return name.slice(1, slashIndex);
  throw new Error("frontend-package-organization-missing");
}

function frontendConfigPath(): string {
  return `.${organizationName()}/frontend/config.ts`;
}

export { frontendConfigPath, frontendPackageName };
