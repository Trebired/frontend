import type { WizardHiddenState } from "./step_state.js";
import { firstNonScriptHTMLElementChild } from "#er0dlx1gtbzh";

function wizardNavControls(root: HTMLElement, tagName: string) {
  return Array.from(root.querySelectorAll(tagName))
  .filter((el): el is HTMLElement => el instanceof HTMLElement)
  .map((host) =>
    tagName === "wizard-final-action"
    ? host
    : firstNonScriptHTMLElementChild(host) || host,
  );
}

function finalOnlyControl(element: HTMLElement) {
  if (
    element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement
  )
  return element;
  const found = element.querySelector("button, input[type=submit]");
  return found instanceof HTMLButtonElement || found instanceof HTMLInputElement
  ? found
  : null;
}

function updateWizardNav(
  prevButtons: HTMLElement[],
  nextButtons: HTMLElement[],
  finalOnlyEls: HTMLElement[],
  index: number,
  lastIndex: number,
  stepValid: boolean,
) {
  prevButtons.forEach((button) => {
      button.hidden = index <= 0;
  });
  nextButtons.forEach((button) => {
      button.hidden = index >= lastIndex;
      (button as HTMLButtonElement).disabled = !stepValid;
  });
  finalOnlyEls.forEach((element) => {
      element.hidden = index !== lastIndex;
      const control = finalOnlyControl(element);
      if (control) control.disabled = !stepValid;
  });
}

function captureNavState(element: HTMLElement) {
  const control = finalOnlyControl(element) || element;
  const disabled =
  control instanceof HTMLButtonElement || control instanceof HTMLInputElement
  ? control.disabled
  : false;
  return { hidden: element.hidden, disabled };
}

function restoreMeasuredNav(
  elements: HTMLElement[],
  states: { hidden: WizardHiddenState; disabled: boolean }[],
) {
  elements.forEach((element, index) => {
      element.hidden = states[index].hidden;
      const control = finalOnlyControl(element) || element;
      if (
        control instanceof HTMLButtonElement ||
          control instanceof HTMLInputElement
      )
      control.disabled = states[index].disabled;
  });
}

export {
  wizardNavControls,
  updateWizardNav,
  captureNavState,
  restoreMeasuredNav,
};
