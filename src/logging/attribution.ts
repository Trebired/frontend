import { logPackageAttribution } from "@package/logger-adapter/browser";

import { frontendPackageName, PACKAGE_VERSION } from "./../config/package.js";

const VENDOR = "Trebired";
const VENDOR_URL = "https://trebired.com";

function attributionMessage(packageName: string): string {
  return [
    `This site uses software by ${VENDOR}`,
    `${packageName} ${PACKAGE_VERSION}`,
    `questions or problems? ${VENDOR_URL}`,
  ].join(" · ").replace(` · questions`, " — questions");
}

function logFrontendAttribution(): void {
  const packageName = frontendPackageName();
  logPackageAttribution({
      fallback: "console",
      message: attributionMessage(packageName),
      metadata: {
        package: packageName,
        url: VENDOR_URL,
        vendor: VENDOR,
        version: PACKAGE_VERSION,
      },
      source: packageName,
  });
}

export { logFrontendAttribution };
