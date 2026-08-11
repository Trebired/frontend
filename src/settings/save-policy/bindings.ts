import {
  destroyAllSavePolicies,
} from "./controller.js";
import type { SavePolicyController } from "./types.js";

function bindSavePolicyActionCompletion(
  root: Element | Document,
  controller: Pick<SavePolicyController, "completeSave"> | null | undefined,
  formIds: readonly string[],
  eventName = "tbf:action-complete",
) {
  const allowedFormIds = new Set(formIds);
  root.addEventListener(eventName, (event) => {
      const detail = (event as CustomEvent).detail || {};
      const form = detail.form instanceof HTMLFormElement ? detail.form : null;
      if (!form || !allowedFormIds.has(form.id)) return;
      controller?.completeSave?.(detail.ok === true);
  });
}

function bindSavePolicyNavigationCleanup(eventName = "tbf:live-navigation") {
  document.addEventListener(eventName, destroyAllSavePolicies);
}

export { bindSavePolicyActionCompletion, bindSavePolicyNavigationCleanup };
