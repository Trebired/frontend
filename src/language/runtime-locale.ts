import { requestJsonPayload } from "#yasd5gi3ad9a";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { text } from "./shared.js";

type LocaleRuntimeOptions = {
  endpoint?: string;
  persistLocale?: (lang: string, endpoint: string) => Promise<unknown>;
  refresh?: (lang: string) => Promise<unknown> | unknown;
};

const LOCALE_OPTION_SELECTOR = "[data-tbf-locale-option]";
const localeButtons = new WeakSet<HTMLButtonElement>();
const busyLocaleButtons = new WeakSet<HTMLButtonElement>();

function defaultLocaleEndpoint(button: HTMLButtonElement, options: LocaleRuntimeOptions) {
  return text(
    options.endpoint || button.getAttribute("data-tbf-locale-endpoint"),
    "/ui/lang/set",
  );
}

async function defaultPersistLocale(lang: string, endpoint: string) {
  return requestJsonPayload(endpoint, {
    method: "POST",
    body: { lang },
  });
}

function defaultRefreshLocale() {
  if (typeof window === "undefined") return false;
  window.location.reload();
  return true;
}

async function applyLocale(
  lang: string,
  options: LocaleRuntimeOptions = {},
  button?: HTMLButtonElement,
) {
  const endpoint = button
    ? defaultLocaleEndpoint(button, options)
    : text(options.endpoint, "/ui/lang/set");
  const persist = options.persistLocale || defaultPersistLocale;
  const refresh = options.refresh || defaultRefreshLocale;
  const result: any = await persist(lang, endpoint);
  if (result && typeof result === "object" && result.ok === false) return false;
  await refresh(lang);
  return true;
}

function bindLocaleOption(
  button: HTMLButtonElement | null,
  options: LocaleRuntimeOptions = {},
) {
  if (!(button instanceof HTMLButtonElement)) return false;
  if (localeButtons.has(button)) return true;
  localeButtons.add(button);
  button.addEventListener("click", async (event) => {
    if (busyLocaleButtons.has(button)) return;
    const lang = text(button.value);
    if (!lang) return;
    event.preventDefault();
    busyLocaleButtons.add(button);
    button.disabled = true;
    try {
      await applyLocale(lang, options, button);
    } finally {
      busyLocaleButtons.delete(button);
      button.disabled = false;
    }
  });
  return true;
}

function bindLocaleSwitchers(
  root: BindRoot = document,
  options: LocaleRuntimeOptions = {},
) {
  queryAll<HTMLButtonElement>(root, LOCALE_OPTION_SELECTOR).forEach((button) => {
    bindLocaleOption(button, options);
  });
}

export {
  LOCALE_OPTION_SELECTOR,
  applyLocale,
  bindLocaleOption,
  bindLocaleSwitchers,
};
export type { LocaleRuntimeOptions };
