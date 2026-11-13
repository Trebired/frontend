import { verifyCardStackOptions } from "./card.mjs";
import { verifyPopoverItemButtons } from "./popover-item.mjs";
import { verifySourceLanguageRowToggle } from "./nested-interactive.mjs";

async function verifyPrimitiveContracts(importDist) {
  await verifyCardStackOptions(importDist);
  await verifyPopoverItemButtons(importDist);
  await verifySourceLanguageRowToggle(importDist);
}

export { verifyPrimitiveContracts };
