import { updateWizardNav } from "./nav.js";
import { stepIsValid, reportStepValidity } from "./validity.js";
import { animateWizardStep } from "./animation.js";

function createWizardNavigator(
  root: HTMLElement,
  steps: HTMLElement[],
  prevButtons: HTMLElement[],
  nextButtons: HTMLElement[],
  finalOnlyEls: HTMLElement[],
  lastIndex: number,
  initialIndex: number,
) {
  let currentIndex = initialIndex;
  let animating = false;

  function recomputeValidity() {
    updateWizardNav(
      prevButtons,
      nextButtons,
      finalOnlyEls,
      currentIndex,
      lastIndex,
      stepIsValid(steps[currentIndex]),
    );
  }

  function goTo(nextIndex: number) {
    if (animating || nextIndex < 0 || nextIndex > lastIndex) return;
    if (nextIndex > currentIndex && !stepIsValid(steps[currentIndex])) {
      reportStepValidity(steps[currentIndex]);
      return;
    }
    const previousIndex = currentIndex;
    currentIndex = nextIndex;
    animating = true;
    updateWizardNav(
      prevButtons,
      nextButtons,
      finalOnlyEls,
      currentIndex,
      lastIndex,
      stepIsValid(steps[currentIndex]),
    );
    animateWizardStep(root, steps, previousIndex, currentIndex, () => {
        animating = false;
    });
  }

  return {
    recomputeValidity,
    goToPrevious: () => goTo(currentIndex - 1),
    goToNext: () => goTo(currentIndex + 1),
  };
}

export { createWizardNavigator };
