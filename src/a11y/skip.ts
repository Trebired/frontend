import { A11Y_MAIN_ID } from "./attributes.js";

function mainElement(root: Document): HTMLElement | null {
  const byId = root.getElementById(A11Y_MAIN_ID);
  if (byId) return byId;
  return root.querySelector<HTMLElement>("main");
}

function ensureSkipTarget(root?: Document | null): HTMLElement | null {
  const owner = root || (typeof document === "undefined" ? null : document);
  if (!owner) return null;
  const main = mainElement(owner);
  if (!main) return null;
  if (!main.id) main.id = A11Y_MAIN_ID;
  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  return main;
}

export { ensureSkipTarget };
