import { closeAll as closeStaticDropdowns } from "#xz5oe3tx9xqe";
import { closeAllModals } from "#8rm3pzkj3gge";
import { hidePopover } from "#knbi1qla9fbx";
import { hideTooltip } from "#yf1o70q7eshd";
import { runOverlayClosers } from "./closers.js";

function closeAllOverlays() {
  closeAllModals();
  hidePopover();
  hideTooltip();
  closeStaticDropdowns(null);
  runOverlayClosers();
}

export { closeAllOverlays };
