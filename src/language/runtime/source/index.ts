import { bindRoot, isInteractiveTarget, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { text } from "#kv9urtb9dbq5";
import { mountSourceLanguageFileTrees } from "./file-tree.js";
import { getActiveSourceLanguageBucket, parseSourceLanguageItems } from "./parse.js";
import {
  SOURCE_BUCKET_TABS_ROOT_SELECTOR,
  SOURCE_RESET_SELECTOR,
  SOURCE_ROOT_SELECTOR,
  SOURCE_ROW_SELECTOR,
} from "./selectors.js";
import { renderSourceLanguageState, seedSourceLanguageTotals } from "./render.js";
import type { SourceLanguageController, SourceLanguageRuntimeOptions } from "./types.js";

const sourceControllers = new WeakMap<HTMLElement, SourceLanguageController>();

function createSourceLanguageController(
  root: HTMLElement,
  options: SourceLanguageRuntimeOptions = {},
): SourceLanguageController | null {
  const items = parseSourceLanguageItems(root);
  if (!items.length) {
    mountSourceLanguageFileTrees(root, options);
    return null;
  }
  const excluded = new Set<string>();
  let activeBucket = getActiveSourceLanguageBucket(root);
  const cleanups: Array<() => void> = [];
  const render = () => renderSourceLanguageState(root, items, excluded, activeBucket, options);
  bindControllerEvents(root, excluded, render, cleanups);
  bindTabEvents(root, (nextBucket) => {
    activeBucket = nextBucket;
    render();
  }, cleanups);
  bindReset(root, excluded, render, cleanups);
  mountSourceLanguageFileTrees(root, options);
  seedSourceLanguageTotals(root);
  render();
  return { destroy: () => destroyController(root, cleanups), render, root };
}

function destroyController(root: HTMLElement, cleanups: Array<() => void>) {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  sourceControllers.delete(root);
}

function bindControllerEvents(
  root: HTMLElement,
  excluded: Set<string>,
  render: () => void,
  cleanups: Array<() => void>,
) {
  const onClick = (event: Event) => handleRowToggle(root, excluded, render, event);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    handleRowToggle(root, excluded, render, event);
  };
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeyDown);
  cleanups.push(() => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeyDown);
  });
}

function handleRowToggle(
  root: HTMLElement,
  excluded: Set<string>,
  render: () => void,
  event: Event,
) {
  const target = event.target instanceof Element ? event.target : null;
  const row = target?.closest<HTMLElement>(SOURCE_ROW_SELECTOR);
  if (!row || !root.contains(row)) return;
  if (target !== row && isInteractiveTarget(target)) return;
  event.preventDefault();
  const languageId = text(row.getAttribute("data-tbf-source-language-id"));
  if (!languageId) return;
  if (excluded.has(languageId)) excluded.delete(languageId);
  else excluded.add(languageId);
  render();
}

function bindTabEvents(
  root: HTMLElement,
  onBucketChange: (bucket: string) => void,
  cleanups: Array<() => void>,
) {
  const tabsRoot = root.querySelector<HTMLElement>(SOURCE_BUCKET_TABS_ROOT_SELECTOR);
  if (!tabsRoot) return;
  let activeBucket = getActiveSourceLanguageBucket(root);
  const onTabsChange = () => {
    const nextBucket = getActiveSourceLanguageBucket(root);
    if (nextBucket === activeBucket) return;
    activeBucket = nextBucket;
    onBucketChange(nextBucket);
  };
  tabsRoot.addEventListener("tabs:change", onTabsChange);
  cleanups.push(() => tabsRoot.removeEventListener("tabs:change", onTabsChange));
}

function bindReset(
  root: HTMLElement,
  excluded: Set<string>,
  render: () => void,
  cleanups: Array<() => void>,
) {
  const resetButton = root.querySelector<HTMLButtonElement>(SOURCE_RESET_SELECTOR);
  if (!resetButton) return;
  const onReset = (event: Event) => {
    event.preventDefault();
    if (!excluded.size) return;
    excluded.clear();
    render();
  };
  resetButton.addEventListener("click", onReset);
  cleanups.push(() => resetButton.removeEventListener("click", onReset));
}

function bindSourceLanguageRoot(root: HTMLElement, options: SourceLanguageRuntimeOptions = {}) {
  const existing = sourceControllers.get(root);
  if (existing) {
    if (options.force === true) existing.destroy();
    else return existing;
  }
  const controller = createSourceLanguageController(root, options);
  if (controller) sourceControllers.set(root, controller);
  return controller;
}

function bindSourceLanguageRuntime(
  root: BindRoot = document,
  options: SourceLanguageRuntimeOptions = {},
) {
  const scope = bindRoot(root);
  const roots = queryAll<HTMLElement>(scope, SOURCE_ROOT_SELECTOR);
  if (scope instanceof HTMLElement && scope.matches(SOURCE_ROOT_SELECTOR) && !roots.includes(scope)) {
    roots.unshift(scope);
  }
  roots.forEach((sourceRoot) => bindSourceLanguageRoot(sourceRoot, options));
}

export {
  SOURCE_ROOT_SELECTOR,
  bindSourceLanguageRoot,
  bindSourceLanguageRuntime,
  mountSourceLanguageFileTrees,
};
export type { SourceLanguageRuntimeOptions };
