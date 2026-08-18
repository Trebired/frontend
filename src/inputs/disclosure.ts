import {
  closestElement,
  queryAll,
  setAriaExpanded,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const DISCLOSURE_SELECTOR = frontendDataSelector("disclosure");
const DISCLOSURE_TRIGGER_SELECTOR = frontendDataSelector("disclosure-trigger");
const DISCLOSURE_PANEL_SELECTOR = frontendDataSelector("disclosure-panel");
const DISCLOSURE_CHANGE_EVENT = frontendEventName("disclosure");

type DisclosureState = {
  open: boolean;
  panel: HTMLElement | null;
  root: HTMLElement;
  trigger: HTMLElement | null;
};

function readDisclosureOpen(root: HTMLElement) {
  return root.getAttribute(frontendDataAttr("disclosure-open")) === "true";
}

function disclosureState(root: HTMLElement): DisclosureState {
  return {
    open: readDisclosureOpen(root),
    panel: root.querySelector<HTMLElement>(DISCLOSURE_PANEL_SELECTOR),
    root,
    trigger: root.querySelector<HTMLElement>(DISCLOSURE_TRIGGER_SELECTOR),
  };
}

function dispatchDisclosureChange(state: DisclosureState) {
  state.root.dispatchEvent(new CustomEvent(DISCLOSURE_CHANGE_EVENT, {
        bubbles: true,
        detail: state,
  }));
}

function setDisclosureOpen(root: HTMLElement, open: boolean) {
  const state = disclosureState(root);
  state.open = open;
  root.setAttribute(frontendDataAttr("disclosure-open"), open ? "true" : "false");
  state.panel?.setAttribute(frontendDataAttr("disclosure-panel-open"), open ? "true" : "false");
  state.panel?.toggleAttribute("inert", !open);
  setAriaExpanded(state.trigger, open);
  dispatchDisclosureChange(state);
  return state;
}

function toggleDisclosure(root: HTMLElement) {
  return setDisclosureOpen(root, !readDisclosureOpen(root));
}

function bindDisclosure(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(frontendDataAttr("disclosure-bound"))) return null;
  root.setAttribute(frontendDataAttr("disclosure-bound"), "true");
  const state = setDisclosureOpen(root, readDisclosureOpen(root));
  state.trigger?.addEventListener("click", (event) => {
      event.preventDefault();
      toggleDisclosure(root);
  });
  state.trigger?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleDisclosure(root);
  });
  return state;
}

function bindDisclosures(root: BindRoot = document) {
  queryAll<HTMLElement>(root, DISCLOSURE_SELECTOR).forEach(bindDisclosure);
  if (root instanceof Element && root.matches(DISCLOSURE_TRIGGER_SELECTOR)) {
    bindDisclosure(closestElement(root, DISCLOSURE_SELECTOR));
  }
}

export {
  DISCLOSURE_CHANGE_EVENT,
  DISCLOSURE_PANEL_SELECTOR,
  DISCLOSURE_SELECTOR,
  DISCLOSURE_TRIGGER_SELECTOR,
  bindDisclosure,
  bindDisclosures,
  setDisclosureOpen,
  toggleDisclosure,
};
export type { DisclosureState };
