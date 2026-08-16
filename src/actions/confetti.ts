import {
  frontendClassName,
  frontendCssVar,
  frontendDataSelector,
  frontendEventName,
} from "#5vbaqj4pirp3";

const CONFETTI_EVENT = frontendEventName("confetti");
const CONFETTI_SELECTOR = [
  frontendDataSelector("confetti", "true"),
  frontendDataSelector("confetti", "1"),
].join(",");

type ConfettiOptions = {
  durationMs?: number;
  particles?: number;
};

function shouldFireActionSuccessConfetti(trigger: HTMLElement | null, configured = false) {
  if (configured) return true;
  return Boolean(trigger && trigger.matches(CONFETTI_SELECTOR));
}

function fireSuccessConfetti(options: ConfettiOptions = {}) {
  if (typeof document === "undefined") return false;
  const particles = Math.max(8, Math.min(80, Number(options.particles) || 36));
  const layer = document.createElement("div");
  layer.className = frontendClassName("confetti");
  layer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < particles; index += 1) {
    const piece = document.createElement("i");
    piece.style.setProperty("--x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--d", `${Math.random() * 0.7 + 0.4}s`);
    piece.style.setProperty("--r", `${Math.random() * 360}deg`);
    piece.style.setProperty(frontendCssVar("confetti-hue"), `${Math.floor(Math.random() * 360)}deg`);
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  document.dispatchEvent(
    new CustomEvent(CONFETTI_EVENT, {
        detail: { layer, options },
    }),
  );
  window.setTimeout(() => layer.remove(), Number(options.durationMs) || 1400);
  return true;
}

function maybeFireActionSuccessConfetti(
  trigger: HTMLElement | null,
  configured = false,
  options: ConfettiOptions = {},
) {
  if (!shouldFireActionSuccessConfetti(trigger, configured)) return false;
  return fireSuccessConfetti(options);
}

export {
  CONFETTI_EVENT,
  CONFETTI_SELECTOR,
  fireSuccessConfetti,
  maybeFireActionSuccessConfetti,
  shouldFireActionSuccessConfetti,
};
export type { ConfettiOptions };
