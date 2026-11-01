import { cssTimeMs, cssToken } from "./../../../dom/motion.js";
import { motionReduced } from "./../../../a11y/attributes.js";

const paneAnimations = new WeakMap<HTMLElement, Animation>();

function cancelPaneAnimation(pane: HTMLElement) {
  const animation = paneAnimations.get(pane);
  if (!animation) return;
  animation.cancel();
  paneAnimations.delete(pane);
}

function animateTabPane(pane: HTMLElement) {
  if (typeof pane.animate !== "function" || motionReduced()) return;
  cancelPaneAnimation(pane);
  const offset = cssToken(pane, "ui-tabs-motion-offset", "8px");
  pane.style.willChange = "opacity, transform";
  const nextAnimation = pane.animate(
    [
      { opacity: 0, transform: `translateY(${offset})` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: cssTimeMs(pane, "ui-tabs-motion-duration", 290),
      easing: cssToken(pane, "ui-tabs-motion-easing", "cubic-bezier(0.22, 1, 0.36, 1)"),
    },
  );

  paneAnimations.set(pane, nextAnimation);
  void nextAnimation.finished?.catch (() => undefined);
  const finish = () => {
    if (paneAnimations.get(pane) === nextAnimation) paneAnimations.delete(pane);
    pane.style.willChange = "";
    pane.style.opacity = "";
    pane.style.transform = "";
  };

  nextAnimation.addEventListener("finish", finish, { once: true });
  nextAnimation.addEventListener("cancel", finish, { once: true });
}

export { animateTabPane, cancelPaneAnimation };
