import { toString } from "#dqy2d22qyujv";
import {
  bindDisclosure,
  setDisclosureOpen as setPackageDisclosureOpen,
  toggleDisclosure,
} from "#4v0ws2g2hwfc";
import { resolveDocumentTarget } from "#dqy2d22qyujv";
import { noop } from "#dqy2d22qyujv";
import { frontendDataSelector } from "#5vbaqj4pirp3";

type DisclosureController = {
  close: (animate?: boolean) => void;
  open: (animate?: boolean) => void;
  panel: HTMLElement;
  root: HTMLElement;
  toggle: (animate?: boolean) => void;
  trigger: HTMLElement;
};

const rootBindings = new WeakMap<HTMLElement, DisclosureController>();
const DISCLOSURE_ROOT_SELECTOR = frontendDataSelector("disclosure");
const DISCLOSURE_TRIGGER_SELECTOR = frontendDataSelector("disclosure-trigger");
const DISCLOSURE_PANEL_SELECTOR = frontendDataSelector("disclosure-panel");

function disclosureParts(root: HTMLElement) {
  const trigger = root.querySelector(DISCLOSURE_TRIGGER_SELECTOR);
  const panel = root.querySelector(DISCLOSURE_PANEL_SELECTOR);
  return {
    panel: panel instanceof HTMLElement ? panel : null,
    trigger: trigger instanceof HTMLElement ? trigger : null,
  };
}

function createDisclosure(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  const existing = rootBindings.get(root);
  if (existing) return existing;

  const { panel, trigger } = disclosureParts(root);
  if (!panel || !trigger) return null;

  bindDisclosure(root);

  const controller: DisclosureController = {
    close() {
      setPackageDisclosureOpen(root, false);
    },
    open() {
      setPackageDisclosureOpen(root, true);
    },
    panel,
    root,
    toggle() {
      toggleDisclosure(root);
    },
    trigger,
  };
  rootBindings.set(root, controller);
  return controller;
}

function disclosureSwitchEntries(detail: any) {
  return Array.isArray(detail && detail.switches) ? detail.switches : [detail];
}

function disclosureTargetNode(entry: any) {
  const value = toString(
    entry &&
      (entry.id || entry.target || entry.root || entry.selector || entry.panel),
  );
  if (value.includes(" ")) return null;
  return resolveDocumentTarget(value);
}

function disclosureRootForEntry(entry: any) {
  const node = disclosureTargetNode(entry);
  if (!(node instanceof HTMLElement)) return null;
  return node.matches(DISCLOSURE_ROOT_SELECTOR)
  ? node
  : node.closest(DISCLOSURE_ROOT_SELECTOR);
}

function switchDisclosureEntry(entry: any) {
  const root = disclosureRootForEntry(entry);
  if (!(root instanceof HTMLElement)) return false;
  const controller = createDisclosure(root);
  if (!controller) return false;
  if (entry && entry.open === true) controller.open();
  else if (entry && (entry.open === false || entry.close === true))
  controller.close();
  else controller.toggle();
  return true;
}

function bindDisclosureHost(host: HTMLElement) {
  if (host.matches(DISCLOSURE_ROOT_SELECTOR)) createDisclosure(host);
  host.querySelectorAll<HTMLElement>(DISCLOSURE_ROOT_SELECTOR).forEach((root) =>
    createDisclosure(root),
  );
}

const defineDisclosureRootElement = noop;

export {
  bindDisclosureHost,
  createDisclosure,
  defineDisclosureRootElement,
  disclosureSwitchEntries,
  switchDisclosureEntry,
};
