import type { ReactNode } from "react";
import { readJsonScript } from "#er0dlx1gtbzh";
import { harvestInlineIcons } from "#e55z7pkijewq";
import { frontendDataAttr, frontendEventName } from "#5vbaqj4pirp3";
import { registerPageCleanup, runSpaRebind } from "#o9lroe7t0ma6";
import { RenderCurrentUrlProvider } from "#pwuc6i9ku53k";

type ReactRootOptions = {
  hydrate?: boolean;
};
type LiveIslandMountOptions = {
  component: (props: any) => ReactNode;
  hydratedAttr?: string;
  hydratedEvent?: string;
  initialState?: unknown;
  onMounted?: (root: Element, initialState: unknown) => void;
  root: Element | string | null;
  stateId?: string;
  wrap?: (node: ReactNode, context: {
      initialState: unknown;
      root: Element;
  }) => ReactNode;
};

const roots = new WeakMap<Element, {render:(node:ReactNode)=>void;unmount:()=>void}>();
const mountedRoots = new Set<Element>();
const remountWatched = new Set<string>();

function resolveEsmInterop<T>(namespace: any, probe: string): T {
  return (typeof namespace?.[probe] === "function" ? namespace : namespace?.default) as T;
}

async function mountReactRoot(
  root: Element,
  node: ReactNode,
  options: ReactRootOptions = {},
) {
  const client = resolveEsmInterop<typeof import("react-dom/client")>(
    await import("react-dom/client"),
    "createRoot",
  );
  const existing = roots.get(root);
  if (existing) {
    existing.render(node);
    return existing;
  }
  const created = options.hydrate === true
  ? client.hydrateRoot(root, node as any)
  : client.createRoot(root);
  if (options.hydrate !== true) created.render(node as any);
  roots.set(root, created);
  mountedRoots.add(root);
  return created;
}

async function renderReactRoot(root: Element, node: ReactNode) {
  return await mountReactRoot(root, node, { hydrate: false });
}

function unmountReactRoot(root: Element) {
  const existing = roots.get(root);
  if (!existing) return false;
  existing.unmount();
  roots.delete(root);
  mountedRoots.delete(root);
  return true;
}

function watchIslandRemount(options: LiveIslandMountOptions) {
  const selector = typeof options.root === "string" ? options.root.trim() : "";
  if (!selector || remountWatched.has(selector)) return;
  if (typeof document === "undefined") return;
  remountWatched.add(selector);
  document.addEventListener(frontendEventName("rehydrate"), () => {
      const element = document.getElementById(selector.replace(/^#/, ""));
      if (!(element instanceof Element)) return;
      if (element.getAttribute(frontendDataAttr("live-island-hydrated")) === "true") return;
      void mountLiveIsland(options);
  });
}

const rebindScheduled = new WeakSet<Element>();

function scheduleIslandRebind(target: Element) {
  if (rebindScheduled.has(target)) return;
  rebindScheduled.add(target);
  const run = () => {
    rebindScheduled.delete(target);
    if (target.isConnected) runSpaRebind(target);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else setTimeout(run, 0);
}

function markIslandHydrated(target: Element, hydratedAttr?: string) {
  target.setAttribute(hydratedAttr || frontendDataAttr("live-hydrated"), "true");
  target.setAttribute(frontendDataAttr("live-island-hydrated"), "true");
}

function islandRuntimeBinder(
  react: typeof import("react"),
  binder: { markHydrated: () => void; onFirstCommit: () => void; target: Element },
) {
  let bound = false;
  return function IslandRuntimeBinder(props: { children?: ReactNode }) {
    react.useEffect(() => {
        binder.markHydrated();
        if (bound) {
          scheduleIslandRebind(binder.target);
          return;
        }
        bound = true;
        runSpaRebind(binder.target);
        binder.onFirstCommit();
    });
    return props.children ?? null;
  };
}

async function mountLiveIsland(options: LiveIslandMountOptions) {
  const target =
  typeof options.root === "string"
  ? document.getElementById(options.root.replace(/^#/, ""))
  : options.root;
  if (!(target instanceof Element)) return null;
  const state = options.stateId
  ? readJsonScript(options.stateId, {})
  : options.initialState || {};
  const react = resolveEsmInterop<typeof import("react")>(await import("react"), "createElement");
  const child = react.createElement(options.component, { initialState: state });
  const userWrapped = options.wrap
  ? options.wrap(child, { initialState: state, root: target })
  : child;
  const wrapped = react.createElement(RenderCurrentUrlProvider, {
      currentUrl: window.location.href,
    }, userWrapped);
  let committed = () => undefined as void;
  const commit = new Promise<void>((resolve) => {
      committed = resolve;
  });
  const markHydrated = () => markIslandHydrated(target, options.hydratedAttr);
  const node = react.createElement(
    islandRuntimeBinder(react, { markHydrated, onFirstCommit: () => committed(), target }),
    null,
    wrapped,
  );
  const hydrate = target.childNodes.length > 0;
  if (hydrate) harvestInlineIcons(target);
  const root = await mountReactRoot(target, node, { hydrate });
  await commit;
  registerPageCleanup(target instanceof HTMLElement ? target : null, () => {
      unmountReactRoot(target);
  });
  markHydrated();
  target.dispatchEvent(
    new CustomEvent(options.hydratedEvent || frontendEventName("live-island-hydrated"), {
        bubbles: true,
        detail: { initialState: state, root: target },
    }),
  );
  options.onMounted?.(target, state);
  watchIslandRemount(options);
  return root;
}

export {
  mountLiveIsland,
  mountReactRoot,
  readJsonScript,
};
export type { LiveIslandMountOptions, ReactRootOptions };

export *from "./re-exports.js";
