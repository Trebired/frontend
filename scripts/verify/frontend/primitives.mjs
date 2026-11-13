import { verifyCardStackOptions } from "./card.mjs";
import { verifyPopoverItemButtons } from "./popover-item.mjs";

async function verifyPrimitiveContracts(importDist) {
  await verifyCardStackOptions(importDist);
  await verifyPopoverItemButtons(importDist);
}

export { verifyPrimitiveContracts };
