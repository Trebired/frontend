import { verifyClassPrefix } from "./prefix.mjs";
import { verifyContainers } from "./containers.mjs";
import { verifyFrontendConfig } from "./config.mjs";
import { verifyFrontendPresets } from "./presets.mjs";

async function verifyConfigContract(context) {
  await verifyFrontendConfig(context);
  await verifyFrontendPresets(context);
  await verifyContainers(context);
  await verifyClassPrefix(context);
}

export { verifyConfigContract };
