import { closestElement, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { setTooltipText } from "#yf1o70q7eshd";

const VISIBILITY_SELECTOR = frontendDataSelector("visibility");
const VISIBILITY_TRIGGER_SELECTOR = frontendDataSelector("visibility-trigger");
const VISIBILITY_CHANGE_EVENT = frontendEventName("visibility");

const STATE_ATTR = frontendDataAttr("visibility");
const BOUND_ATTR = frontendDataAttr("visibility-bound");
const LABEL_HIDDEN_ATTR = frontendDataAttr("visibility-label-hidden");
const LABEL_SHOWN_ATTR = frontendDataAttr("visibility-label-shown");
const TOOLTIP_ATTR = frontendDataAttr("tooltip");

type VisibilityState = {
  hidden: boolean;
  root: HTMLElement;
  triggers: HTMLElement[];
};

function readHidden(root: HTMLElement): boolean {
  return root.getAttribute(STATE_ATTR) === "hidden";
}

function triggersOf(root: HTMLElement): HTMLElement[] {
  return queryAll<HTMLElement>(root, VISIBILITY_TRIGGER_SELECTOR)
  .filter((trigger) => closestElement(trigger, VISIBILITY_SELECTOR) === root);
}

function labelTrigger(trigger: HTMLElement, hidden: boolean) {
  const label = trigger.getAttribute(hidden ? LABEL_HIDDEN_ATTR : LABEL_SHOWN_ATTR);
  if (label) {
    trigger.setAttribute("aria-label", label);
    if (trigger.hasAttribute(TOOLTIP_ATTR)) {
      trigger.setAttribute(TOOLTIP_ATTR, label);
      setTooltipText(trigger, label);
    }
  }
  trigger.setAttribute("aria-pressed", hidden ? "true" : "false");
}

function setVisibilityHidden(root: HTMLElement, hidden: boolean): VisibilityState {
  root.setAttribute(STATE_ATTR, hidden ? "hidden" : "shown");
  const triggers = triggersOf(root);
  triggers.forEach((trigger) => labelTrigger(trigger, hidden));
  const state: VisibilityState = { hidden, root, triggers };
  root.dispatchEvent(new CustomEvent(VISIBILITY_CHANGE_EVENT, { bubbles: true, detail: state }));
  return state;
}

function toggleVisibility(root: HTMLElement): VisibilityState {
  return setVisibilityHidden(root, !readHidden(root));
}

function bindVisibility(root: HTMLElement | null): VisibilityState | null {
  if (!(root instanceof HTMLElement) || root.hasAttribute(BOUND_ATTR)) return null;
  root.setAttribute(BOUND_ATTR, "true");
  const state = setVisibilityHidden(root, readHidden(root));
  state.triggers.forEach((trigger) => trigger.addEventListener("click", (event) => {
        event.preventDefault();
        toggleVisibility(root);
  }));
  return state;
}

function bindVisibilities(root: BindRoot = document) {
  queryAll<HTMLElement>(root, VISIBILITY_SELECTOR).forEach(bindVisibility);
  if (root instanceof Element && root.matches(VISIBILITY_TRIGGER_SELECTOR)) {
    bindVisibility(closestElement(root, VISIBILITY_SELECTOR));
  }
}

export {
  VISIBILITY_CHANGE_EVENT,
  VISIBILITY_SELECTOR,
  VISIBILITY_TRIGGER_SELECTOR,
  bindVisibilities,
  bindVisibility,
  readHidden as visibilityHidden,
  setVisibilityHidden,
  toggleVisibility,
};
export type { VisibilityState };
