import { setStepState, showWizardStep } from "./step_state.js";

const WIZARD_ANIMATION_MS = 240;
const wizardAnimationTokens = new WeakMap<HTMLElement, number>();

function prefersReducedWizardMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function finishWizardAnimation(
  root: HTMLElement,
  token: number,
  steps: HTMLElement[],
  index: number,
  onDone: () => void,
) {
  if (wizardAnimationTokens.get(root) !== token) return;
  showWizardStep(steps, index);
  onDone();
}

function animateWizardStep(
  root: HTMLElement,
  steps: HTMLElement[],
  fromIndex: number,
  toIndex: number,
  onDone: () => void,
) {
  if (fromIndex === toIndex || prefersReducedWizardMotion()) {
    showWizardStep(steps, toIndex);
    onDone();
    return;
  }

  const token = (wizardAnimationTokens.get(root) || 0) + 1;
  wizardAnimationTokens.set(root, token);

  const fromStep = steps[fromIndex];
  const toStep = steps[toIndex];

  steps.forEach((step, index) => {
      if (index !== fromIndex && index !== toIndex) setStepState(step, "", true);
  });
  setStepState(fromStep, "active", false);
  setStepState(toStep, "enter", false);
  toStep.getBoundingClientRect();

  window.requestAnimationFrame(() => {
      if (wizardAnimationTokens.get(root) !== token) return;
      setStepState(fromStep, "exit", false);
      setStepState(toStep, "active", false);
  });

  window.setTimeout(() => {
      finishWizardAnimation(root, token, steps, toIndex, onDone);
    }, WIZARD_ANIMATION_MS + 80);
}

export { animateWizardStep };
