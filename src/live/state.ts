type LiveFormSnapshot = {
  checked: boolean;
  value: string;
};

function formFieldKey(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
) {
  const name = element.name || element.id;
  if (!name) return "";
  if (
    element instanceof HTMLInputElement &&
      (element.type === "checkbox" || element.type === "radio")
  ) {
    return `${name}:${element.value}`;
  }
  return name;
}

function captureFormState(root: ParentNode) {
  const state = new Map<string, LiveFormSnapshot>();
  root.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(
    "input,select,textarea",
  ).forEach((element) => {
      const key = formFieldKey(element);
      if (!key) return;
      state.set(key, {
          checked: element instanceof HTMLInputElement ? element.checked : false,
          value: element.value,
      });
  });
  return state;
}

function restoreFormState(
  root: ParentNode,
  state: Map<string, LiveFormSnapshot>,
) {
  root.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(
    "input,select,textarea",
  ).forEach((element) => {
      const snapshot = state.get(formFieldKey(element));
      if (!snapshot) return;
      element.value = snapshot.value;
      if (element instanceof HTMLInputElement) element.checked = snapshot.checked;
  });
}

function captureWizardSteps(root: ParentNode) {
  const state = new Map<string, string>();
  root.querySelectorAll("wizard-root").forEach((wizardRoot) => {
      if (!(wizardRoot instanceof HTMLElement) || !wizardRoot.id) return;
      const activeStep = wizardRoot.querySelector(
        'wizard-step[data-wizard-step-state="active"]',
      );
      if (activeStep instanceof HTMLElement && activeStep.id) {
        state.set(wizardRoot.id, activeStep.id);
      }
  });
  return state;
}

function restoreWizardStepChildren(
  wizardRoot: HTMLElement,
  targetStepId: string,
) {
  Array.from(wizardRoot.children).forEach((child) => {
      if (
        !(child instanceof HTMLElement) ||
          child.tagName.toLowerCase() !== "wizard-step"
      ) {
        return;
      }
      const isTarget = child.id === targetStepId;
      child.hidden = !isTarget;
      if (isTarget) {
        child.setAttribute("data-wizard-step-state", "active");
        child.removeAttribute("aria-hidden");
        child.removeAttribute("inert");
        return;
      }
      child.removeAttribute("data-wizard-step-state");
      child.setAttribute("aria-hidden", "true");
      child.setAttribute("inert", "");
  });
}

function restoreWizardSteps(root: ParentNode, state: Map<string, string>) {
  if (!state.size) return;
  root.querySelectorAll("wizard-root").forEach((wizardRoot) => {
      if (!(wizardRoot instanceof HTMLElement) || !wizardRoot.id) return;
      const targetStepId = state.get(wizardRoot.id);
      if (targetStepId) restoreWizardStepChildren(wizardRoot, targetStepId);
  });
}

function importChildNodes(element: Element) {
  return Array.from(element.childNodes).map((node) => {
      return document.importNode(node, true);
  });
}

export {
  captureFormState,
  captureWizardSteps,
  importChildNodes,
  restoreFormState,
  restoreWizardSteps,
};
export type { LiveFormSnapshot };
