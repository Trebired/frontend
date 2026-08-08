import { setStepState, showWizardStep } from "./step_state.js";
import type { WizardHiddenState } from "./step_state.js";
import { updateWizardNav, captureNavState, restoreMeasuredNav } from "./nav.js";
import { stepIsValid } from "./validity.js";

function restoreMeasuredStep(
  step: HTMLElement,
  state: {
    ariaHidden: string | null;
    hidden: WizardHiddenState;
    inert: boolean;
    pointerEvents: string;
    state: string;
    visibility: string;
  },
) {
  step.hidden = state.hidden;
  step.style.pointerEvents = state.pointerEvents;
  step.style.visibility = state.visibility;
  if (state.state) step.setAttribute("data-wizard-step-state", state.state);
  else step.removeAttribute("data-wizard-step-state");
  if (state.ariaHidden == null) step.removeAttribute("aria-hidden");
  else step.setAttribute("aria-hidden", state.ariaHidden);
  if (state.inert) step.setAttribute("inert", "");
  else step.removeAttribute("inert");
}

function syncWizardStepSize(
  root: HTMLElement,
  steps: HTMLElement[],
  prevButtons: HTMLElement[],
  nextButtons: HTMLElement[],
  finalOnlyEls: HTMLElement[],
  lastIndex: number,
) {
  const states = steps.map((step) => ({
        ariaHidden: step.getAttribute("aria-hidden"),
        hidden: step.hidden,
        inert: step.hasAttribute("inert"),
        pointerEvents: step.style.pointerEvents,
        state: step.getAttribute("data-wizard-step-state") || "",
        visibility: step.style.visibility,
  }));
  const prevStates = prevButtons.map(captureNavState);
  const nextStates = nextButtons.map(captureNavState);
  const finalStates = finalOnlyEls.map(captureNavState);
  let maxHeight = 0;
  let maxWidth = 0;

  root.style.removeProperty("--wizard-step-min-height");
  root.style.removeProperty("--wizard-step-width");

  steps.forEach((step, stepIndex) => {
      steps.forEach((candidate, candidateIndex) => {
          setStepState(
            candidate,
            candidateIndex === stepIndex ? "active" : "",
            candidateIndex !== stepIndex,
          );
          candidate.style.pointerEvents = "none";
          candidate.style.visibility = "hidden";
      });
      updateWizardNav(
        prevButtons,
        nextButtons,
        finalOnlyEls,
        stepIndex,
        lastIndex,
        stepIsValid(step),
      );
      const rect = step.getBoundingClientRect();
      maxHeight = Math.max(maxHeight, Math.ceil(rect.height));
      maxWidth = Math.max(maxWidth, Math.ceil(rect.width));
  });
  steps.forEach((step, index) => restoreMeasuredStep(step, states[index]));
  restoreMeasuredNav(prevButtons, prevStates);
  restoreMeasuredNav(nextButtons, nextStates);
  restoreMeasuredNav(finalOnlyEls, finalStates);

  if (maxHeight > 0)
  root.style.setProperty("--wizard-step-min-height", `${maxHeight}px`);
  if (maxWidth > 0)
  root.style.setProperty("--wizard-step-width", `${maxWidth}px`);
}

function bindWizardSizing(
  root: HTMLElement,
  steps: HTMLElement[],
  prevButtons: HTMLElement[],
  nextButtons: HTMLElement[],
  finalOnlyEls: HTMLElement[],
  lastIndex: number,
) {
  const sync = () =>
  syncWizardStepSize(
    root,
    steps,
    prevButtons,
    nextButtons,
    finalOnlyEls,
    lastIndex,
  );
  window.addEventListener("resize", sync);
  if (document.readyState !== "complete") {
    window.addEventListener("load", sync, { once: true });
  }
  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(sync).catch(() => {});
  }
}

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
  syncWizardStepSize(
    root,
    steps,
    prevButtons,
    nextButtons,
    finalOnlyEls,
    lastIndex,
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
  bindWizardSizing(
    root,
    steps,
    prevButtons,
    nextButtons,
    finalOnlyEls,
    lastIndex,
  );
  return currentIndex;
}

export { initializeWizardStep };
