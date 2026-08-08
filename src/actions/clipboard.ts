import {
  appendIcon,
  renderIconElement,
} from "#e55z7pkijewq";
import { onReady, queryAll, readElementJson, type BindRoot } from "#er0dlx1gtbzh";

type CopyButtonOptions = {
  iconOnly?: boolean;
  target?: Element | string | null;
  value?: string | null;
};

const COPY_SELECTOR = "[data-tbf-copy],copy-button";
const COPY_CONFIG_SELECTOR =
  'script[type="application/json"][data-copy-button-config],script[type="application/json"][data-tbf-copy-config]';
const copyBindings = new WeakSet<HTMLElement>();

function normalizeClipboardText(value: unknown) {
  return String(value == null ? "" : value)
    .replace(/\r\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/[\u00A0\u2007\u202F]/gu, " ")
    .trim();
}

function readTargetValue(target: Element | null) {
  if (!target) return "";
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return normalizeClipboardText(target.value);
  }
  return normalizeClipboardText(target.textContent);
}

async function writeClipboard(text: string) {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return legacyCopy(text);
}

function legacyCopy(text: string) {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  area.style.top = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function copyTargetId(target: unknown) {
  const normalized = String(target || "").trim();
  return normalized.startsWith("#") ? normalized.slice(1).trim() : normalized;
}

function resolveCopyTarget(target: CopyButtonOptions["target"]) {
  if (target instanceof Element) return target;
  const id = copyTargetId(target);
  return id && typeof document !== "undefined" ? document.getElementById(id) : null;
}

function firstCopyButton(host: HTMLElement) {
  if (host.matches("button,a,[role='button']")) return host;
  return Array.from(host.children).find((child): child is HTMLElement => {
    return child instanceof HTMLElement &&
      child.tagName.toLowerCase() !== "script";
  }) || null;
}

function hostOptions(host: HTMLElement): CopyButtonOptions {
  return readElementJson<CopyButtonOptions>(host, COPY_CONFIG_SELECTOR, {});
}

function buttonValue(button: HTMLElement, options: CopyButtonOptions) {
  const direct = normalizeClipboardText(
    options.value ?? (button as HTMLButtonElement).value,
  );
  if (direct) return direct;
  const target =
    options.target ||
    button.getAttribute("data-tbf-copy-target") ||
    button.getAttribute("aria-controls") ||
    "";
  return readTargetValue(resolveCopyTarget(target));
}

function restoreIcon(button: HTMLElement, originalHtml: string, iconOnly: boolean) {
  if (!iconOnly) {
    button.innerHTML = originalHtml;
    return;
  }
  button.replaceChildren();
  appendIcon(button, "remixicon clipboard-line");
}

function showCopied(button: HTMLElement, originalHtml: string, iconOnly: boolean) {
  if (!iconOnly) return;
  button.replaceChildren();
  void renderIconElement(
    appendIcon(button, "remixicon checkbox-circle-line"),
    "remixicon checkbox-circle-line",
  );
  window.setTimeout(() => restoreIcon(button, originalHtml, iconOnly), 1200);
}

async function runCopyButton(
  button: HTMLElement,
  event?: Event,
  options: CopyButtonOptions = {},
) {
  event?.preventDefault();
  const value = buttonValue(button, options);
  if (!value) return false;
  const originalHtml = button.innerHTML;
  const iconOnly = options.iconOnly === true;
  (button as HTMLButtonElement).disabled = true;
  try {
    const ok = await writeClipboard(value);
    if (ok) showCopied(button, originalHtml, iconOnly);
    return ok;
  } finally {
    (button as HTMLButtonElement).disabled = false;
    if (!iconOnly) button.innerHTML = originalHtml;
  }
}

function bindCopyButton(
  target: HTMLElement | null,
  options: CopyButtonOptions = {},
) {
  const button = target && target.matches("copy-button")
    ? firstCopyButton(target)
    : target;
  if (!(button instanceof HTMLElement) || copyBindings.has(button)) return false;
  const merged = { ...options };
  copyBindings.add(button);
  button.addEventListener("click", (event) => {
    void runCopyButton(button, event, merged);
  });
  return true;
}

function bindCopyHost(host: HTMLElement) {
  const button = firstCopyButton(host);
  if (!button) return false;
  return bindCopyButton(button, hostOptions(host));
}

function bindCopyButtons(root: BindRoot = document) {
  queryAll<HTMLElement>(root, COPY_SELECTOR).forEach((host) => {
    if (host.matches("copy-button")) bindCopyHost(host);
    else bindCopyButton(host, {
      target: host.getAttribute("data-tbf-copy-target") || undefined,
    });
  });
}

function bootCopyButtons() {
  onReady(() => bindCopyButtons(document));
}

export {
  COPY_CONFIG_SELECTOR,
  COPY_SELECTOR,
  bindCopyButton,
  bindCopyButtons,
  bindCopyHost,
  bootCopyButtons,
  copyTargetId,
  normalizeClipboardText,
  readTargetValue,
  runCopyButton,
  writeClipboard,
};
export type { CopyButtonOptions };
