import { readOrganizationIdentity, readPackageJsonUrl, toTrimmedString } from "@trebired/utils";

const packageJson = readPackageJsonUrl(new URL("../../package.json", import.meta.url));
const organization = readOrganizationIdentity({ packageJson });

const PACKAGE_VERSION = toTrimmedString(packageJson?.version, "7.1.16");

function frontendPackageName(): string {
  const packageJsonName = toTrimmedString(packageJson?.name);
  const name =
  packageJsonName ||
    (organization.name ? `@${organization.name}/frontend` : "frontend");
  if (!name) throw new Error("frontend-package-name-missing");
  return name;
}

function organizationName(): string {
  if (organization.name) return organization.name;
  throw new Error("frontend-package-organization-missing");
}

function frontendConfigPath(): string {
  return `.${organizationName()}/frontend/config.ts`;
}

export { frontendConfigPath, frontendPackageName, PACKAGE_VERSION };
