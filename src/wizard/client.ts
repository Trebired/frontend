import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { wizardNavControls } from "./nav.js";
import { initializeWizardStep } from "./sizing.js";
import { createWizardNavigator } from "./navigator.js";

const boundWizardRoots = new WeakSet<HTMLElement>();

function wizardSteps(root: HTMLElement) {
  return Array.from(root.children).filter(
    (child): child is HTMLElement =>
    child instanceof HTMLElement &&
      child.tagName.toLowerCase() === "wizard-step",
  );
}

function bindWizardRoot(root: HTMLElement) {
  if (boundWizardRoots.has(root)) return;
  boundWizardRoots.add(root);

  const id = root.id;
  if (!id) return;

  const steps = wizardSteps(root);
  if (!steps.length) return;

  const prevButtons = wizardNavControls(root, "wizard-previous-button");
  const nextButtons = wizardNavControls(root, "wizard-next-button");
  const finalOnlyEls = wizardNavControls(root, "wizard-final-action");
  const lastIndex = steps.length - 1;

  const currentIndex = initializeWizardStep(
    root,
    steps,
    prevButtons,
    nextButtons,
    finalOnlyEls,
    lastIndex,
  );
  const navigator = createWizardNavigator(
    root,
    steps,
    prevButtons,
    nextButtons,
    finalOnlyEls,
    lastIndex,
    currentIndex,
  );

  prevButtons.forEach((button) => {
      button.addEventListener("click", navigator.goToPrevious);
  });
  nextButtons.forEach((button) => {
      button.addEventListener("click", navigator.goToNext);
  });
  root.addEventListener("input", navigator.recomputeValidity);
  root.addEventListener("change", navigator.recomputeValidity);
  root.addEventListener("backend-status:checked", navigator.recomputeValidity);
}

function bindWizard(scope: BindRoot = document) {
  queryAll<HTMLElement>(scope, "wizard-root").forEach(bindWizardRoot);
}

export { bindWizard, bindWizardRoot, wizardSteps };
