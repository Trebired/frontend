import { createElement, useSyncExternalStore, type ReactNode } from "react";

import {
  requestJson as packageRequestJson,
  type JsonRequestOptions,
} from "#v1p6uw62hhsf";
import { Icon, type IconProps } from "#lbkpzw8nphru";
import {
  closestElement,
  dispatchInputChange,
  isInteractiveTarget,
  parseJsonText,
  resolveDocumentTarget,
} from "#er0dlx1gtbzh";
import { Button } from "#4woymc9xhupl";

type TranslatorVars = Record<string, unknown>;
type Translator = (key: string, vars?: TranslatorVars) => string;
type ButtonProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  variant?: string;
};

const messages: Record<string, string> = {
  "actions.add": "Add",
  "actions.cancel": "Cancel",
  "actions.chooseFile": "Choose file",
  "actions.chooseFolder": "Choose folder",
  "actions.clear": "Clear",
  "actions.remove": "Remove",
  "actions.search": "Search",
  "actions.select": "Select",
  "actions.toggle": "Toggle",
  "actions.unselect": "Unselect",
  "actions.unselectAll": "Unselect all",
  "display.exitFullscreen": "Exit fullscreen",
  "display.fullscreen": "Fullscreen",
  "empty.noFileSelected": "No file selected",
  "empty.noMatchesFound": "No matches found",
  "empty.nothingHere": "Nothing here",
  "feedback.chooseAcceptedFileFormat": "Choose an accepted file format.",
  "feedback.fileFormatNotAllowed": "File format not allowed",
  "feedback.onlyImageFilesCanBeCropped": "Only image files can be cropped.",
  "files.cropBeforeSaving": "Crop before saving.",
  "files.cropImage": "Crop image",
  "files.dropFilesHere": "Drop files here",
  "files.dropFilesOrFoldersHere": "Drop files or folders here",
  "files.selectedUploadPreview": "Selected upload preview",
  "files.upload": "Upload",
  "files.uploadOnlyFormats": "Only {formats}",
  "files.uploadPreview": "Upload preview",
  "selection.all": "All",
  "state.unavailable": "Unavailable",
};

function toString(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function onlyString(value: unknown, fallback = "") {
  return toString(value, fallback);
}

function joinClassNames(values: unknown[]) {
  return values.map((value) => toString(value)).filter(Boolean).join(" ");
}

function appendClassName(base: unknown, next: unknown) {
  return joinClassNames([base, next]);
}

function stringifyJsonForHtml(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c");
}

function documentLang() {
  return typeof document === "undefined"
    ? ""
    : toString(document.documentElement.getAttribute("lang"));
}

function createLocalTranslator(_url?: string, _lang?: string): Translator {
  return (key, vars = {}) => {
    let text = messages[key] || key;
    Object.entries(vars).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value ?? ""));
    });
    return text;
  };
}

function defineMessages<T extends Record<string, unknown>>(messagesMap: T) {
  return messagesMap;
}

function noop() {}

function readHostJsonConfig<T extends Record<string, unknown>>(
  host: ParentNode | null,
  selector: string,
  fallback: T,
): T {
  if (!host || typeof host.querySelector !== "function") return fallback;
  const element = host.querySelector(selector);
  return parseJsonText<T>(element?.textContent || "", fallback);
}

function firstNonScriptHTMLElementChild(host: Element) {
  return Array.from(host.children).find((child) => {
    return child instanceof HTMLElement && child.tagName.toLowerCase() !== "script";
  }) as HTMLElement | undefined;
}

function defineFirstChildElement(
  _tagName: string,
  _bind: (child: HTMLElement, host: HTMLElement) => unknown,
) {}

function defineBoundElement(
  _tagName: string,
  _bind: (host: HTMLElement) => unknown,
) {}

function isInUnhydratedIsland(node: unknown) {
  const element = node instanceof Element ? node : null;
  return Boolean(
    element?.closest("[data-live-island-root][data-live-island-hydrated='false']"),
  );
}

function icon(props: IconProps & { [key: string]: unknown; spec: string }) {
  return createElement(Icon, props as IconProps);
}

function button(props: ButtonProps) {
  const { children, className, variant: _variant, ...rest } = props;
  return (
    <Button className={joinClassNames(["btn", className])} {...(rest as any)}>
      {children}
    </Button>
  );
}

function requestJson(input: RequestInfo | URL, options: JsonRequestOptions = {}) {
  return packageRequestJson(input, options);
}

function subscribeUrl(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function currentUrlSnapshot() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function useRenderCurrentUrl() {
  return useSyncExternalStore(subscribeUrl, currentUrlSnapshot, () => "");
}

export {
  appendClassName,
  button,
  closestElement,
  createLocalTranslator,
  defineBoundElement,
  defineFirstChildElement,
  defineMessages,
  dispatchInputChange,
  documentLang,
  firstNonScriptHTMLElementChild,
  icon,
  isInteractiveTarget,
  isInUnhydratedIsland,
  joinClassNames,
  noop,
  onlyString,
  readHostJsonConfig,
  requestJson,
  resolveDocumentTarget,
  stringifyJsonForHtml,
  toString,
  useRenderCurrentUrl,
};
export type { Translator };
