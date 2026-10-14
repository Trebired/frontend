import { A11Y_BOUND_ATTR, A11Y_FIELD_ATTR, A11Y_PANEL_SELECTOR } from "./attributes.js";
import { announce } from "./announce.js";
import { getA11ySettings, setA11ySettings } from "./apply.js";
import { queryAll } from "./../dom/index.js";

import type { BindRoot } from "./../dom/index.js";
import type { FrontendA11ySettings, ResolvedFrontendA11ySettings } from "./types.js";

type A11yField = "contrast" | "motion" | "textSize";

type A11yLabels = Partial<Record<string, string>>;

const FIELDS: A11yField[] = ["contrast", "motion", "textSize"];

let labels: A11yLabels = {};

let syncing = false;

function fieldOf(target: Element): A11yField | null {
  const holder = target.closest(`[${A11Y_FIELD_ATTR}]`);
  const name = holder?.getAttribute(A11Y_FIELD_ATTR) || "";
  return FIELDS.includes(name as A11yField) ? name as A11yField : null;
}

function patchFor(field: A11yField, value: string, checked: boolean): Partial<FrontendA11ySettings> {
  if (field === "textSize") return { textSize: Number(value) as FrontendA11ySettings["textSize"] };
  if (field === "motion") return { motion: value as FrontendA11ySettings["motion"] };
  return { contrast: checked ? "high" : "normal" };
}

function announceChange(field: A11yField, resolved: ResolvedFrontendA11ySettings): void {
  const spoken = labels[field];
  if (!spoken) return;
  const value = field === "textSize" ? `${resolved.textSize}%` : String(resolved[field]);
  announce(`${spoken}: ${value}`);
}

function handleChange(event: Event): void {
  if (syncing) return;
  const target = event.target as HTMLInputElement | null;
  if (!target || !(target instanceof HTMLInputElement)) return;
  const field = fieldOf(target);
  if (!field) return;
  const resolved = setA11ySettings(patchFor(field, target.value, target.checked));
  announceChange(field, resolved);
}

function checkedFor(field: A11yField, input: HTMLInputElement, settings: FrontendA11ySettings): boolean {
  if (field === "contrast") return settings.contrast === "high";
  if (field === "motion") return input.value === settings.motion;
  return Number(input.value) === settings.textSize;
}

function syncPanel(panel: Element, settings: FrontendA11ySettings): void {
  syncing = true;
  for (const input of queryAll<HTMLInputElement>(panel, "input")) {
    const field = fieldOf(input);
    if (!field) continue;
    const next = checkedFor(field, input, settings);
    if (input.checked === next) continue;
    input.checked = next;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  syncing = false;
}

function syncA11yControls(root: BindRoot = document, settings?: FrontendA11ySettings): void {
  const current = settings || getA11ySettings();
  for (const panel of queryAll<HTMLElement>(root, A11Y_PANEL_SELECTOR)) syncPanel(panel, current);
}

function bindA11yControls(root: BindRoot = document, panelLabels?: A11yLabels): void {
  if (panelLabels) labels = { ...labels, ...panelLabels };
  const settings = getA11ySettings();
  for (const panel of queryAll<HTMLElement>(root, A11Y_PANEL_SELECTOR)) {
    if (panel.getAttribute(A11Y_BOUND_ATTR) !== "true") {
      panel.setAttribute(A11Y_BOUND_ATTR, "true");
      panel.addEventListener("change", handleChange);
    }
    syncPanel(panel, settings);
  }
}

export { bindA11yControls, syncA11yControls };
export type { A11yLabels };
