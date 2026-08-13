import { showWizardStep } from "./step_state.js";
import { updateWizardNav } from "./nav.js";
import { stepIsValid } from "./validity.js";

function markWizardReady(root: HTMLElement) {
  window.requestAnimationFrame(() => {
      root.setAttribute("data-wizard-ready", "true");
  });
}

function initializeWizardStep(
  root: HTMLElement,
  steps: HTMLElement[],
  prevButtons: HTMLElement[],
  nextButtons: HTMLElement[],
  finalOnlyEls: HTMLElement[],
  lastIndex: number,
) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => !step.hidden),
  );
  showWizardStep(steps, currentIndex);
  updateWizardNav(
    prevButtons,
    nextButtons,
    finalOnlyEls,
    currentIndex,
    lastIndex,
    stepIsValid(steps[currentIndex]),
  );
  markWizardReady(root);
  return currentIndex;
}

export { initializeWizardStep };
