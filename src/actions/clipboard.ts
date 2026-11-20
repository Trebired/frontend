import { onReady, queryAll, readElementJson, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

type CopyButtonOptions = {
  target?: Element | string | null;
  value?: string | null;
};

const COPY_SELECTOR = `${frontendDataSelector("copy")},copy-button`;
const COPY_CONFIG_SELECTOR =
`script[type="application/json"]${frontendDataSelector("copy-button-config")},`
+`script[type="application/json"]${frontendDataSelector("copy-config")}`;
const copyBindings = new WeakSet<HTMLElement>();

function normalizeClipboardText(value: unknown) {
  return String(value == null ? "" : value)
  .replace(/\r\n/gu, "\n")
  .replace(/\r/gu, "\n")
  .replace(/[\u00A0\u2007\u202F]/gu, " ")
  .trim();
}

function readKeyValueRows(target: Element) {
  return Array.from(target.querySelectorAll(frontendDataSelector("key-value-row")))
  .filter((row) => {
      const hidden = row.closest("[hidden]");
      return !hidden || !target.contains(hidden);
  })
  .map((row) => {
      const label = normalizeClipboardText(
        row.querySelector(frontendDataSelector("key-value-label"))?.textContent,
      ).replace(/:\s*$/u, "");
      const value = normalizeClipboardText(
        row.querySelector(frontendDataSelector("key-value-value"))?.textContent,
      ).replace(/\s+/gu, " ");
      return label ? `${label}: ${value}` : value;
  })
  .filter(Boolean)
  .join("\n");
}

function readTargetValue(target: Element | null) {
  if (!target) return "";
  if (target.getAttribute(frontendDataAttr("copy-mode")) === "rows") return readKeyValueRows(target);
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
    button.getAttribute(frontendDataAttr("copy-target")) ||
    button.getAttribute("aria-controls") ||
    "";
  return readTargetValue(resolveCopyTarget(target));
}

const COPIED_MS = 1200;

function copyIcon(button: HTMLElement, state: "done" | "idle") {
  return button.querySelector<HTMLElement>(frontendDataSelector("copy-icon", state));
}

function showCopied(button: HTMLElement) {
  const idle = copyIcon(button, "idle");
  const done = copyIcon(button, "done");
  if (!idle || !done) return;
  idle.hidden = true;
  done.hidden = false;
  window.setTimeout(() => {
      idle.hidden = false;
      done.hidden = true;
    }, COPIED_MS);
}

async function runCopyButton(
  button: HTMLElement,
  event?: Event,
  options: CopyButtonOptions = {},
) {
  event?.preventDefault();
  const value = buttonValue(button, options);
  if (!value) return false;
  (button as HTMLButtonElement).disabled = true;
  try {
    const ok = await writeClipboard(value);
    if (ok) showCopied(button);
    return ok;
  } finally {
    (button as HTMLButtonElement).disabled = false;
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
          target: host.getAttribute(frontendDataAttr("copy-target")) || undefined,
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
