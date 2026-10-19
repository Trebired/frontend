import { verifyClassPrefix } from "./prefix.mjs";
import { verifyContainers } from "./containers.mjs";
import { verifyFrontendConfig } from "./config.mjs";

async function verifyConfigContract(context) {
  await verifyFrontendConfig(context);
  await verifyContainers(context);
  await verifyClassPrefix(context);
}

export { verifyConfigContract };
