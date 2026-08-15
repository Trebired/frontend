import { readPackageIdentity } from "@trebired/utils";

const packageIdentity = readPackageIdentity({
    fallbackSlug: "frontend",
    fallbackVersion: "7.1.16",
    packageJsonUrl: new URL("../../package.json", import.meta.url),
});
const PACKAGE_VERSION = packageIdentity.version;

function frontendPackageName(): string {
  const name = packageIdentity.name;
  if (!name) throw new Error("frontend-package-name-missing");
  return name;
}

function organizationName(): string {
  const organization = packageIdentity.organizationName;
  if (organization) return organization;
  throw new Error("frontend-package-organization-missing");
}

function frontendConfigPath(): string {
  return `.${organizationName()}/frontend/config.ts`;
}

export { frontendConfigPath, frontendPackageName, PACKAGE_VERSION };
