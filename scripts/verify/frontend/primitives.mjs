import { verifyCardStackOptions } from "./card.mjs";
import { verifyPopoverItemButtons } from "./popover-item.mjs";
import { verifySourceLanguageRowToggle } from "./nested-interactive.mjs";
import { verifySourceLanguagePanelKeys } from "./language-keys.mjs";
import { verifyOverflowTooltip } from "./tooltip-overflow.mjs";
import { verifyTreeFolderToggleKeepsFile } from "./tree/folder-toggle.mjs";
import { verifyFileTreeLinks } from "./tree/links.mjs";
import { verifySearchInputWidth } from "./search/input-width.mjs";
import { verifyNumber } from "./number.mjs";
import { verifyCanvasPanelFullscreen } from "./canvas-panel-fullscreen.mjs";
import { verifySearchRemotePanel } from "./search/remote.mjs";

async function verifyPrimitiveContracts(importDist) {
  await verifyCardStackOptions(importDist);
  await verifyPopoverItemButtons(importDist);
  await verifySourceLanguageRowToggle(importDist);
  await verifySourceLanguagePanelKeys(importDist);
  await verifyOverflowTooltip(importDist);
  await verifyTreeFolderToggleKeepsFile(importDist);
  await verifyFileTreeLinks(importDist);
  await verifySearchInputWidth(importDist);
  await verifyNumber(importDist);
  await verifyCanvasPanelFullscreen(importDist);
  await verifySearchRemotePanel(importDist);
}

export { verifyPrimitiveContracts };
