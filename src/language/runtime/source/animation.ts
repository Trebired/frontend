const sourceNumberFrames = new WeakMap<HTMLElement, number>();
const sourceTextTimers = new WeakMap<HTMLElement, number>();

function finishNumberAnimation(
  el: HTMLElement,
  target: number,
  formatter: (value: number) => string,
) {
  el.textContent = formatter(target);
  el.dataset.value = String(target);
  el.removeAttribute("data-tbf-source-language-updating");
  sourceNumberFrames.delete(el);
}

function cancelNumberAnimation(el: HTMLElement) {
  const frame = sourceNumberFrames.get(el);
  if (!frame || typeof window === "undefined") return;
  window.cancelAnimationFrame(frame);
  sourceNumberFrames.delete(el);
}

function roundedValue(value: number, precision: number) {
  return precision > 0 ? Number(value.toFixed(precision)) : Math.round(value);
}

function animateNumber(
  el: HTMLElement | null,
  nextValue: number,
  formatter: (value: number) => string,
  fractionDigits: number,
  prefersReducedMotion?: boolean,
) {
  if (!el) return;
  const target = Number(nextValue) || 0;
  const start = Number(el.dataset.value);
  const from = Number.isFinite(start) ? start : target;
  const delta = target - from;
  const precision = Number(fractionDigits) || 0;
  if (prefersReducedMotion || !delta || typeof window === "undefined") {
    finishNumberAnimation(el, target, formatter);
    return;
  }
  startNumberAnimation(el, { delta, formatter, from, precision, target });
}

function startNumberAnimation(
  el: HTMLElement,
  state: {
    delta: number;
    formatter: (value: number) => string;
    from: number;
    precision: number;
    target: number;
  },
) {
  cancelNumberAnimation(el);
  el.setAttribute("data-tbf-source-language-updating", "true");
  const startedAt = performance.now();
  const duration = state.precision > 0 ? 260 : 220;
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = state.from + state.delta * eased;
    el.textContent = state.formatter(roundedValue(value, state.precision));
    if (progress < 1) {
      sourceNumberFrames.set(el, window.requestAnimationFrame(step));
      return;
    }
    finishNumberAnimation(el, state.target, state.formatter);
  };
  sourceNumberFrames.set(el, window.requestAnimationFrame(step));
}

function setAnimatedText(
  el: HTMLElement | null,
  nextText: string,
  prefersReducedMotion?: boolean,
) {
  if (!el || el.textContent === nextText) return;
  if (prefersReducedMotion || typeof window === "undefined") {
    el.textContent = nextText;
    el.removeAttribute("data-tbf-source-language-updating");
    return;
  }
  el.removeAttribute("data-tbf-source-language-updating");
  void el.offsetWidth;
  el.setAttribute("data-tbf-source-language-updating", "true");
  el.textContent = nextText;
  const timer = sourceTextTimers.get(el);
  if (timer) window.clearTimeout(timer);
  sourceTextTimers.set(
    el,
    window.setTimeout(() => {
        el.removeAttribute("data-tbf-source-language-updating");
        sourceTextTimers.delete(el);
      }, 180),
  );
}

export { animateNumber, setAnimatedText };
