type WizardFormControl =
HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function stepFormControls(step: HTMLElement) {
  return Array.from(step.querySelectorAll("input, select, textarea")).filter(
    (el): el is WizardFormControl => {
      if (!(
          el instanceof HTMLInputElement ||
            el instanceof HTMLSelectElement ||
            el instanceof HTMLTextAreaElement
      ))
      return false;
      if (el instanceof HTMLInputElement && el.type === "hidden") return false;
      return !el.disabled;
    },
  );
}

function stepHasVisibleBadStatus(step: HTMLElement) {
  return Array.from(step.querySelectorAll('[data-input-status="bad"]')).some(
    (el) => el instanceof HTMLElement && !el.hidden,
  );
}

function stepIsValid(step: HTMLElement) {
  if (stepHasVisibleBadStatus(step)) return false;
  return stepFormControls(step).every((control) => control.checkValidity());
}

function reportStepValidity(step: HTMLElement) {
  const invalid = stepFormControls(step).find(
    (control) => !control.checkValidity(),
  );
  if (invalid) {
    invalid.reportValidity();
    return;
  }
  const badInput = Array.from(
    step.querySelectorAll('[data-input-status="bad"]'),
  ).find((el) => el instanceof HTMLElement && !el.hidden);
  const field = badInput
  ? badInput.querySelector("input, select, textarea")
  : null;
  if (field instanceof HTMLElement) field.focus();
}

export { stepIsValid, reportStepValidity };
