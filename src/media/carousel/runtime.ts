import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendClassName, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { A11Y_CHANGE_EVENT } from "./../../a11y/attributes.js";
import { prefersReducedMotion } from "./state.js";

const ACTIVE = frontendClassName("is-active");
const bound = new WeakSet<Element>();

function part(root: Element, name: string) {
  return queryAll<HTMLElement>(root, `.${frontendClassName(name)}`);
}

function bindCarousel(root: HTMLElement) {
  const slides = part(root, "carousel-slide");
  const dots = part(root, "carousel-dot");
  const interval = Number(root.getAttribute(frontendDataAttr("carousel-interval"))) || 0;
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains(ACTIVE)));
  let paused = false;
  let timer = 0;
  const schedule = () => {
    window.clearInterval(timer);
    timer = 0;
    if (paused || slides.length < 2 || interval <= 0 || prefersReducedMotion()) return;
    timer = window.setInterval(() => {
        if (!root.isConnected) return window.clearInterval(timer);
        show(index + 1);
      }, interval);
  };
  const show = (next: number) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, position) => {
        slide.classList.toggle(ACTIVE, position === index);
        if (position === index) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
    });
    dots.forEach((dot, position) => {
        dot.classList.toggle(ACTIVE, position === index);
        if (position === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
    });
    schedule();
  };
  const pause = (value: boolean) => {
    paused = value;
    schedule();
  };
  part(root, "carousel-nav-prev").forEach((button) => button.addEventListener("click", () => show(index - 1)));
  part(root, "carousel-nav-next").forEach((button) => button.addEventListener("click", () => show(index + 1)));
  dots.forEach((dot, position) => dot.addEventListener("click", () => show(position)));
  root.addEventListener("mouseenter", () => pause(true));
  root.addEventListener("mouseleave", () => pause(false));
  root.addEventListener("focusin", () => pause(true));
  root.addEventListener("focusout", () => pause(false));
  document.addEventListener(A11Y_CHANGE_EVENT, schedule);
  schedule();
}

function bindCarousels(root: BindRoot = document) {
  if (typeof window === "undefined") return;
  queryAll<HTMLElement>(root, frontendDataSelector("carousel")).forEach((carousel) => {
      if (bound.has(carousel)) return;
      bound.add(carousel);
      bindCarousel(carousel);
  });
}

export { bindCarousels };
