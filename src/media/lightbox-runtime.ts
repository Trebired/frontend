import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendClassName, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { lockBodyScroll } from "#f3dd7yszexpp";
import { cssTimeMs } from "./../dom/motion.js";
import { captureFocus, trapTabKey } from "./focus-trap.js";

const CLOSE_ANIMATION_MS = 320;
const VISIBLE = frontendClassName("is-visible");
const bound = new WeakSet<Element>();

type Gallery = { alt: string; images: string[]; index: number };

function readGallery(button: HTMLElement): Gallery {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(button.getAttribute(frontendDataAttr("expandable-gallery")) || "[]");
    images = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    images = [];
  }
  const index = Number(button.getAttribute(frontendDataAttr("expandable-image"))) || 0;
  return { alt: button.getAttribute(frontendDataAttr("expandable-alt")) || "", images, index };
}

function lightboxTemplate(button: HTMLElement) {
  const next = button.nextElementSibling;
  return next?.tagName === "TEMPLATE" && next.hasAttribute(frontendDataAttr("lightbox-template")) ? next as HTMLTemplateElement : null;
}

function renderSlide(node: HTMLElement, gallery: Gallery) {
  const label = gallery.images.length > 1 ? `${gallery.alt} ${gallery.index + 1}` : gallery.alt;
  const image = node.querySelector<HTMLImageElement>("img");
  if (image) {
    image.src = gallery.images[gallery.index] || "";
    image.alt = label;
  }
  node.querySelectorAll("h2, p").forEach((element) => {
      element.textContent = label;
  });
  node.querySelectorAll<HTMLElement>(frontendDataSelector("lightbox-step")).forEach((step) => {
      const prev = step.getAttribute(frontendDataAttr("lightbox-step")) === "prev";
      step.hidden = prev ? gallery.index <= 0 : gallery.index >= gallery.images.length - 1;
  });
}

function openLightbox(button: HTMLElement, template: HTMLTemplateElement) {
  const gallery = readGallery(button);
  const node = template.content.firstElementChild?.cloneNode(true);
  if (!(node instanceof HTMLElement) || !gallery.images.length) return;
  const viewer = node.querySelector<HTMLElement>(`.${frontendClassName("lightbox-viewer")}`);
  const step = (delta: number) => {
    gallery.index = Math.min(Math.max(gallery.index + delta, 0), gallery.images.length - 1);
    renderSlide(node, gallery);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
    if (event.key === "Tab") trapTabKey(node, event);
  };
  renderSlide(node, gallery);
  document.body.append(node);
  const releaseScroll = lockBodyScroll();
  const restoreFocus = captureFocus(node);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    window.removeEventListener("keydown", onKeyDown);
    node.classList.remove(VISIBLE);
    viewer?.classList.remove(VISIBLE);
    releaseScroll();
    restoreFocus();
    window.setTimeout(() => node.remove(), cssTimeMs(null, "media-lightbox-motion-close-duration", CLOSE_ANIMATION_MS));
  };
  window.addEventListener("keydown", onKeyDown);
  node.addEventListener("click", close);
  viewer?.addEventListener("click", (event) => event.stopPropagation());
  node.querySelector(frontendDataSelector("lightbox-close"))?.addEventListener("click", (event) => {
      event.stopPropagation();
      close();
  });
  node.querySelectorAll<HTMLElement>(frontendDataSelector("lightbox-step")).forEach((button) => {
      const delta = button.getAttribute(frontendDataAttr("lightbox-step")) === "prev" ? -1 : 1;
      button.addEventListener("click", (event) => {
          event.stopPropagation();
          step(delta);
      });
  });
  requestAnimationFrame(() => {
      node.classList.add(VISIBLE);
      viewer?.classList.add(VISIBLE);
  });
}

function bindExpandableImages(root: BindRoot = document) {
  if (typeof window === "undefined") return;
  queryAll<HTMLElement>(root, frontendDataSelector("expandable-image")).forEach((button) => {
      const template = lightboxTemplate(button);
      if (bound.has(button) || !template) return;
      bound.add(button);
      button.addEventListener("click", () => openLightbox(button, template));
  });
}

export { bindExpandableImages };
