type WizardHiddenState = HTMLElement["hidden"];

function setStepState(step: HTMLElement, state: string, hidden: boolean) {
  const active = state === "active" && hidden === false;
  step.hidden = hidden;
  if (state) step.setAttribute("data-wizard-step-state", state);
  else step.removeAttribute("data-wizard-step-state");
  if (active) {
    step.removeAttribute("aria-hidden");
    step.removeAttribute("inert");
  } else {
    step.setAttribute("aria-hidden", "true");
    step.setAttribute("inert", "");
  }
}

function showWizardStep(steps: HTMLElement[], index: number) {
  steps.forEach((step, stepIndex) => {
      setStepState(
        step,
        stepIndex === index ? "active" : "",
        stepIndex !== index,
      );
  });
}

export type { WizardHiddenState };
export { setStepState, showWizardStep };
