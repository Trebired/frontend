import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { FRONTEND_PREFIX, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";
import { normalizeHexColor } from "./colors.js";

const bound = new WeakSet<Element>();
const VALUE_VAR = `--${FRONTEND_PREFIX}-color-picker-value`;
const OPTION_ATTR = frontendDataAttr("color-option");

function paintSwatch(swatch: HTMLElement | null, color: string) {
  if (!swatch) return;
  if (color) {
    swatch.style.setProperty(VALUE_VAR, color);
    swatch.removeAttribute(frontendDataAttr("color-empty"));
  } else {
    swatch.style.removeProperty(VALUE_VAR);
    swatch.setAttribute(frontendDataAttr("color-empty"), "true");
  }
}

function bindColorPicker(picker: HTMLElement) {
  const hidden = picker.querySelector<HTMLInputElement>("input[type=hidden]");
  const trigger = picker.querySelector<HTMLElement>(frontendDataSelector("popover-trigger"));
  const panel = trigger ? document.getElementById(trigger.getAttribute("aria-controls") || "") : null;
  if (!hidden || !trigger || !panel) return;
  const automatic = picker.getAttribute(frontendDataAttr("color-automatic-label")) || "";
  const text = trigger.querySelector<HTMLElement>(`.${frontendElementClass("color-picker", "value")}`);
  const hex = panel.querySelector<HTMLInputElement>(frontendDataSelector("color-hex"));
  const options = queryAll<HTMLButtonElement>(panel, `[${OPTION_ATTR}]`);
  const set = (input: string, fromHex = false) => {
    const color = normalizeHexColor(input);
    if (!color && !automatic) return;
    if (hidden.value === color) return;
    hidden.value = color;
    paintSwatch(trigger.querySelector(`.${frontendElementClass("color-picker", "swatch")}`), color);
    if (text) text.textContent = color || automatic;
    options.forEach((option) => option.setAttribute("aria-checked", String(option.getAttribute(OPTION_ATTR) === color)));
    if (hex && !fromHex) hex.value = color;
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
  };
  options.forEach((option) => option.addEventListener("click", () => set(option.getAttribute(OPTION_ATTR) || "")));
  hex?.addEventListener("input", () => {
      if (normalizeHexColor(hex.value)) set(hex.value, true);
  });
  hex?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      set(hex.value, true);
      trigger.click();
  });
}

function bindColorPickers(root: BindRoot = document) {
  if (typeof window === "undefined") return;
  queryAll<HTMLElement>(root, frontendDataSelector("color-picker")).forEach((picker) => {
      if (bound.has(picker)) return;
      bound.add(picker);
      bindColorPicker(picker);
  });
}

export { bindColorPickers };
