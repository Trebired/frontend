import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendClassName, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";
import { portalElement } from "#ccvonx3uhbte";
import { registerOverlayCloser } from "#wx6aeo50d9rb";
import { activeSection, observeSections, subscribeActiveSection } from "./section_spy.js";
import { bindSiteHeaderSearches } from "./search.js";

const block = "site-header";
const DESKTOP_QUERY = "(min-width: 768px)";
const CLOSE_DELAY = 180;
const HOVER_GRACE = 400;
const FIT_SLACK = 8;
const SUBPIXEL = 0.5;
const HEADER_SELECTOR = frontendDataSelector("site-header");
const TRIGGER_ATTR = frontendDataAttr("site-header-trigger");
const SECTION_ATTR = frontendDataAttr("site-header-section");
const OVERLAY_SELECTOR = [frontendDataSelector("modal"), `.${frontendClassName("popover")}`].join(",");
const OUTSIDE_IGNORE = [
  frontendDataSelector("popover"),
  frontendDataSelector("layout-portal-root"),
  frontendDataSelector("modal"),
].join(",");

type Controller = {
  closeAll: () => void;
  escape: () => void;
  header: HTMLElement;
  measure: () => void;
  media: (desktop: boolean) => void;
  pointerDown: (target: EventTarget | null) => void;
};

const bound = new WeakSet<Element>();
const controllers = new Set<Controller>();
let installed = false;

function part(element: string) {
  return `.${frontendElementClass(block, element)}`;
}

function isLink(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a[href]"));
}

function live() {
  controllers.forEach((controller) => {
      if (!controller.header.isConnected) controllers.delete(controller);
  });
  return [...controllers];
}

function setHidden(element: HTMLElement, hidden: boolean) {
  element.setAttribute("aria-hidden", String(hidden));
  element.inert = hidden;
}

function installListeners() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  let frame = 0;
  document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") live().forEach((controller) => controller.escape());
  });
  document.addEventListener("pointerdown", (event) => live().forEach((controller) => controller.pointerDown(event.target)));
  window.addEventListener("resize", () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
          frame = 0;
          live().forEach((controller) => controller.measure());
      });
    }, { passive: true });
  const media = window.matchMedia?.(DESKTOP_QUERY);
  media?.addEventListener?.("change", () => live().forEach((controller) => controller.media(media.matches)));
  registerOverlayCloser(() => live().forEach((controller) => controller.closeAll()));
  document.fonts?.ready?.then(() => live().forEach((controller) => controller.measure())).catch (() => {});
}

function menuControl(header: HTMLElement) {
  const toggle = header.querySelector<HTMLButtonElement>(part("toggle"));
  const menu = header.querySelector<HTMLElement>(part("menu"));
  let open = false;
  const set = (next: boolean) => {
    open = next;
    header.setAttribute(frontendDataAttr("site-header-open"), String(next));
    if (menu) setHidden(menu, !next);
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(next));
    const label = toggle.getAttribute(frontendDataAttr(next ? "site-header-label-close" : "site-header-label-open"));
    if (label) toggle.setAttribute("aria-label", label);
  };
  const close = (focus = false) => {
    if (!open) return;
    set(false);
    if (focus) toggle?.focus({ preventScroll: true });
  };
  toggle?.addEventListener("click", () => set(!open));
  menu?.addEventListener("click", (event) => {
      if (isLink(event.target)) close();
  });
  return { close, isOpen: () => open };
}

function sheetRenderer(sheet: HTMLElement | null, triggers: HTMLButtonElement[]) {
  return (open: string, current: string) => {
    triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", String(open !== "" && trigger.getAttribute(TRIGGER_ATTR) === open)));
    if (!sheet) return;
    setHidden(sheet, !open);
    sheet.setAttribute(frontendDataAttr("site-header-sheet"), open ? "open" : "closed");
    queryAll<HTMLElement>(sheet, frontendDataSelector("site-header-section")).forEach((section) => {
        section.hidden = section.getAttribute(SECTION_ATTR) !== current;
    });
  };
}

function focusSection(sheet: HTMLElement | null, key: string) {
  requestAnimationFrame(() => {
      const section = sheet?.querySelector(`[${SECTION_ATTR}="${key}"]`);
      section?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
  });
}

function sheetState(header: HTMLElement, sheet: HTMLElement | null, triggers: HTMLButtonElement[]) {
  const render = sheetRenderer(sheet, triggers);
  const state = { current: "", hoveredAt: 0, open: "", timer: 0 };
  const stay = () => {
    window.clearTimeout(state.timer);
    state.timer = 0;
  };
  const close = () => {
    stay();
    if (!state.open) return;
    state.open = "";
    render(state.open, state.current);
  };
  const show = (key: string, hovered = false) => {
    stay();
    if (hovered) state.hoveredAt = Date.now();
    state.current = key;
    state.open = key;
    render(state.open, state.current);
  };
  const toggle = (key: string, keyboard: boolean) => {
    if (state.open === key && Date.now() - state.hoveredAt >= HOVER_GRACE) return close();
    show(key);
    if (keyboard) focusSection(sheet, key);
  };
  const leave = () => {
    stay();
    if (state.open) state.timer = window.setTimeout(close, CLOSE_DELAY);
  };
  const escape = () => {
    if (!state.open) return;
    const key = state.open;
    const inside = header.contains(document.activeElement);
    close();
    if (inside) header.querySelector<HTMLElement>(`[${TRIGGER_ATTR}="${key}"]`)?.focus({ preventScroll: true });
  };
  return { close, escape, isOpen: () => state.open !== "", leave, show, stay, toggle };
}

function sheetControl(header: HTMLElement) {
  const sheet = header.querySelector<HTMLElement>(part("sheet"));
  const triggers = queryAll<HTMLButtonElement>(header, frontendDataSelector("site-header-trigger"));
  const state = sheetState(header, sheet, triggers);
  const closeOnLink = (event: Event) => {
    if (isLink(event.target)) state.close();
  };
  triggers.forEach((trigger) => {
      const key = trigger.getAttribute(TRIGGER_ATTR) || "";
      trigger.addEventListener("click", (event) => state.toggle(key, event.detail === 0));
      trigger.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "mouse") state.show(key, true);
      });
  });
  header.addEventListener("pointerenter", state.stay);
  header.addEventListener("pointerleave", state.leave);
  header.addEventListener("focusout", (event) => {
      if (state.isOpen() && (!(event.relatedTarget instanceof Node) || !header.contains(event.relatedTarget))) state.close();
  });
  sheet?.addEventListener("pointerenter", state.stay);
  sheet?.addEventListener("click", closeOnLink);
  header.querySelector(part("nav"))?.addEventListener("pointerover", closeOnLink);
  return state;
}

function navOverflow(nav: Element): number {
  const edge = nav.getBoundingClientRect().right;
  let furthest = edge;
  for (const child of nav.children) {
    const rect = child.getBoundingClientRect();
    if (rect.width && rect.right > furthest) furthest = rect.right;
  }
  const overflow = furthest - edge;
  return overflow > SUBPIXEL ? Math.ceil(overflow) : 0;
}

function fitControl(header: HTMLElement, onCompact: () => void) {
  const nav = header.querySelector(part("nav"));
  const attr = frontendDataAttr("site-header-compact");
  const hasMenu = header.getAttribute(frontendDataAttr("site-header-menu")) === "true";
  let compact = false;
  let fitsFrom = 0;
  const measure = () => {
    if (!hasMenu || !nav) return;
    const width = header.clientWidth;
    if (compact) {
      if (!fitsFrom || width < fitsFrom) return;
      compact = false;
      header.removeAttribute(attr);
      measure();
      return;
    }
    const deficit = navOverflow(nav);
    if (deficit <= 0) return;
    fitsFrom = width + deficit + FIT_SLACK;
    compact = true;
    header.setAttribute(attr, "true");
    onCompact();
  };
  return measure;
}

function linkFragment(link: HTMLAnchorElement) {
  const url = new URL(link.getAttribute("href") || "", window.location.href);
  const here = window.location;
  if (!url.hash || url.origin !== here.origin || url.pathname !== here.pathname) return "";
  return decodeURIComponent(url.hash.slice(1));
}

function bindSectionLinks(header: HTMLElement) {
  const links = queryAll<HTMLAnchorElement>(header, `${part("nav")} a[href], ${part("menu-links")} a[href], ${part("sheet")} a[href]`)
  .map((link) => ({
        base: [...link.classList].filter((name) => !name.endsWith("--active")),
        fragment: linkFragment(link),
        link,
        served: link.getAttribute("aria-current") === "page",
  }));
  const fragments = links.map((entry) => entry.fragment).filter(Boolean);
  observeSections(fragments);
  if (!fragments.length) return;
  const update = () => {
    if (!header.isConnected) return unsubscribe();
    const section = activeSection();
    links.forEach(({ base, fragment, link, served }) => {
        const active = fragment ? section !== "" && fragment === section : !section && served;
        link.className = [...base, ...(active ? base.map((name) => `${name}--active`) : [])].join(" ");
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
  };
  const unsubscribe = subscribeActiveSection(update);
  update();
}

function bindSiteHeader(header: HTMLElement) {
  queryAll<HTMLElement>(header, OVERLAY_SELECTOR).forEach((overlay) => portalElement(overlay));
  const menu = menuControl(header);
  const sheet = sheetControl(header);
  const measure = fitControl(header, sheet.close);
  bindSectionLinks(header);
  controllers.add({
      closeAll: () => {
        menu.close();
        sheet.close();
      },
      escape: () => {
        if (menu.isOpen()) menu.close(true);
        sheet.escape();
      },
      header,
      measure,
      media: (desktop) => (desktop ? menu.close() : sheet.close()),
      pointerDown: (target) => {
        if (menu.isOpen() && target instanceof Element && !header.contains(target) && !target.closest(OUTSIDE_IGNORE)) menu.close();
        if (sheet.isOpen() && target instanceof Node && !header.contains(target)) sheet.close();
      },
  });
  installListeners();
  measure();
}

function bindSiteHeaders(root: BindRoot = document) {
  if (typeof window === "undefined") return;
  queryAll<HTMLElement>(root, HEADER_SELECTOR).forEach((header) => {
      if (bound.has(header)) return;
      bound.add(header);
      bindSiteHeader(header);
  });
  bindSiteHeaderSearches(root);
}

export { bindSiteHeaders, DESKTOP_QUERY as SITE_HEADER_DESKTOP_QUERY };
