import { verifyCardStackOptions } from "./card.mjs";
import { verifyPopoverItemButtons } from "./popover-item.mjs";
import { verifySourceLanguageRowToggle } from "./nested-interactive.mjs";
import { verifySourceLanguagePanelKeys } from "./language-keys.mjs";
import { verifyOverflowTooltip } from "./tooltip-overflow.mjs";

async function verifyPrimitiveContracts(importDist) {
  await verifyCardStackOptions(importDist);
  await verifyPopoverItemButtons(importDist);
  await verifySourceLanguageRowToggle(importDist);
  await verifySourceLanguagePanelKeys(importDist);
  await verifyOverflowTooltip(importDist);
}

export { verifyPrimitiveContracts };
