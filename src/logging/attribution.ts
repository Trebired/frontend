import { logPackageAttribution } from "@package/logger-adapter/browser";

import { FRONTEND_PACKAGE_NAME, FRONTEND_PACKAGE_VERSION } from "./../namespace/identity.js";

const VENDOR = "Trebired";
const VENDOR_URL = "https://trebired.com";

function attributionMessage(packageName: string): string {
  return [
    `This site uses software by ${VENDOR}`,
    `${packageName} ${FRONTEND_PACKAGE_VERSION}`,
    `questions or problems? ${VENDOR_URL}`,
  ].join(" · ").replace(` · questions`, " — questions");
}

function logFrontendAttribution(): void {
  const packageName = FRONTEND_PACKAGE_NAME;
  logPackageAttribution({
      fallback: "console",
      message: attributionMessage(packageName),
      metadata: {
        package: packageName,
        url: VENDOR_URL,
        vendor: VENDOR,
        version: FRONTEND_PACKAGE_VERSION,
      },
      source: packageName,
  });
}

export { logFrontendAttribution };
