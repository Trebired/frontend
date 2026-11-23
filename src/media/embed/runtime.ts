import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendClassName, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { fullscreenSupported, toggleFullscreen } from "#e1wjbzbsyghi";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { REMIX_PATHS } from "./paths.js";
import { FRAME_ATTRIBUTE } from "./../frames.js";

type FailureReason = "offline" | "refused" | "timeout" | "unreachable";

const CONSENT_EVENT = "trebired:embed-consent";
const CONSENT_KEY = "trebired.embed-consent.";
const NEAR_VIEWPORT = "300px";
const FAILURE_KEYS: Record<FailureReason, string> = {
  offline: "embedFailedOffline",
  refused: "embedFailedRefused",
  timeout: "embedFailedTimeout",
  unreachable: "embedFailedUnreachable",
};
const bound = new WeakSet<Element>();

function data(root: Element, name: string) {
  return root.getAttribute(frontendDataAttr(name)) || "";
}

function consentGranted(provider: string): boolean {
  try {
    return window.localStorage.getItem(`${CONSENT_KEY}${provider}`) === "granted";
  } catch {
    return false;
  }
}

function rememberConsent(provider: string): void {
  try {
    window.localStorage.setItem(`${CONSENT_KEY}${provider}`, "granted");
  } catch {
    return;
  } finally {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: provider }));
  }
}

async function classifyFailure(src: string): Promise<FailureReason> {
  if (navigator.onLine === false) return "offline";
  try {
    await fetch(src, { cache: "no-store", mode: "no-cors" });
    return "refused";
  } catch {
    return "unreachable";
  }
}

function whenNear(root: Element, run: () => void) {
  if (typeof IntersectionObserver !== "function") return run();
  const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    }, { rootMargin: NEAR_VIEWPORT });
  observer.observe(root);
}

function showFailure(root: HTMLElement, reason: FailureReason) {
  const status = root.querySelector<HTMLElement>(frontendDataSelector("embed-status"));
  if (!status) return;
  const lang = data(root, "embed-lang");
  status.hidden = false;
  status.querySelector(":scope > div")?.remove();
  const mark = status.querySelector<HTMLElement>(`.${frontendClassName("embed-frame-mark")}`);
  if (mark) mark.hidden = false;
  const [headline, detail] = [...status.querySelectorAll<HTMLElement>("p")];
  if (headline) headline.textContent = sourceLanguageMessage("embedFailed", lang);
  if (detail) {
    detail.textContent = sourceLanguageMessage(FAILURE_KEYS[reason], lang);
    detail.hidden = false;
  }
}

function bindFullscreen(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>(frontendDataSelector("embed-fullscreen"));
  if (!button || !fullscreenSupported()) return;
  button.hidden = false;
  const path = button.querySelector("path");
  button.addEventListener("click", () => toggleFullscreen(root));
  document.addEventListener("fullscreenchange", () => {
      path?.setAttribute("d", document.fullscreenElement === root ? REMIX_PATHS["fullscreen-exit-line"] : REMIX_PATHS["fullscreen-line"]);
  });
}

function loadEmbed(root: HTMLElement) {
  const src = data(root, "embed-src");
  const target = root.querySelector<HTMLIFrameElement|HTMLObjectElement>(`[${FRAME_ATTRIBUTE}]`);
  const status = root.querySelector<HTMLElement>(frontendDataSelector("embed-status"));
  if (!src || !target) return;
  let settled = false;
  let timer = 0;
  const settle = (state: "error" | "ready", reason: FailureReason = "timeout") => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    root.setAttribute(frontendDataAttr("embed-state"), state);
    if (state === "ready") {
      if (status) status.hidden = true;
      return bindFullscreen(root);
    }
    if (target instanceof HTMLObjectElement) target.removeAttribute("data");
    else target.src = "about:blank";
    showFailure(root, reason);
  };
  root.setAttribute(frontendDataAttr("embed-state"), "loading");
  if (status) status.hidden = false;
  target.addEventListener("load", () => settle("ready"));
  target.addEventListener("error", () => void classifyFailure(src).then((reason) => settle("error", reason)));
  whenNear(root, () => {
      if (target instanceof HTMLObjectElement) target.data = src;
      else target.src = src;
      timer = window.setTimeout(() => settle("error", "timeout"), Number(data(root, "embed-timeout")) || 10000);
  });
}

function bindEmbed(root: HTMLElement) {
  const provider = data(root, "embed-provider");
  const consent = root.querySelector<HTMLElement>(frontendDataSelector("embed-consent"));
  const start = () => {
    consent?.remove();
    loadEmbed(root);
  };
  if (!provider || consentGranted(provider)) return start();
  const onGrant = (event: Event) => {
    if ((event as CustomEvent<string>).detail !== provider) return;
    window.removeEventListener(CONSENT_EVENT, onGrant);
    if (root.isConnected) start();
  };
  window.addEventListener(CONSENT_EVENT, onGrant);
  consent?.querySelector(frontendDataSelector("embed-grant"))?.addEventListener("click", () => rememberConsent(provider));
}

function bindEmbedFrames(root: BindRoot = document) {
  if (typeof window === "undefined") return;
  queryAll<HTMLElement>(root, frontendDataSelector("embed-src")).forEach((embed) => {
      if (bound.has(embed)) return;
      bound.add(embed);
      bindEmbed(embed);
  });
}

export { bindEmbedFrames };
