import type { ReactNode } from "react";
import { readJsonScript } from "#er0dlx1gtbzh";
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

/**
 * A soft navigation replaces the island with fresh server HTML, and the page's
 * client module is not re-executed because its script src is already loaded. So
 * nothing would mount the new island and every control inside it stays dead.
 * Re-mount whenever a rehydrate leaves an unhydrated island behind.
 */
function watchIslandRemount(options: LiveIslandMountOptions) {
  const selector = typeof options.root === "string" ? options.root.trim() : "";
  if (!selector || remountWatched.has(selector)) return;
  if (typeof document === "undefined") return;
  remountWatched.add(selector);
  document.addEventListener(frontendEventName("rehydrate"), () => {
      const element = document.getElementById(selector.replace(/^#/, ""));
      if (!(element instanceof Element)) return;
      if (element.getAttribute("data-live-island-hydrated") === "true") return;
      void mountLiveIsland(options);
  });
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
  /**
   * The full-page server render is wrapped in `RenderCurrentUrlProvider` with
   * the request URL, so any tree that reads `useRenderCurrentUrl()` (tabs, for
   * one) renders against it. This island hydrates as its own React root with no
   * such ancestor, so without this it falls back to the empty default and
   * mismatches the moment the URL carries route state, e.g. `?tab-x=y` written
   * by a previous tab switch.
   */
  const wrapped = react.createElement(RenderCurrentUrlProvider, {
      currentUrl: window.location.href,
  }, userWrapped);
  /**
   * The tabs, dropdown, checkbox and search binders bail inside an island still
   * marked unhydrated, so they must run again once this one is hydrated. It has
   * to happen from an effect: `hydrateRoot()` returns before React commits, and
   * re-binding earlier would mutate the tree mid-hydration and mismatch.
   */
  function IslandRuntimeBinder(binderProps: { children?: ReactNode }) {
    react.useEffect(() => {
        runSpaRebind(target);
    }, []);
    return binderProps.children ?? null;
  }
  const node = react.createElement(IslandRuntimeBinder, null, wrapped);
  const root = await mountReactRoot(target, node, {
      hydrate: target.childNodes.length > 0,
  });
  registerPageCleanup(target instanceof HTMLElement ? target : null, () => {
      unmountReactRoot(target);
  });
  target.setAttribute(options.hydratedAttr || frontendDataAttr("live-hydrated"), "true");
  /**
   * `LiveIslandMount` renders `data-live-island-hydrated="false"`, and the tabs,
   * dropdown, checkbox and search binders all refuse to bind inside an island
   * still marked unhydrated. Flip that same attribute here, otherwise every one
   * of those controls stays dead for the life of the page.
   */
  target.setAttribute("data-live-island-hydrated", "true");
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
  renderReactRoot,
  unmountReactRoot,
};
export type { LiveIslandMountOptions, ReactRootOptions };

export *from "./assets.js";
export *from "./boot.js";
export *from "./product-shell.js";
export *from "./seo.js";
export *from "./title.js";
export *from "#c55llzkpl4ob";
export *from "#ft8e49grjdee";
export *from "#nn6lx6ueg6es";
export *from "#gknmswavy1t3";
export *from "#7k5l8ya2kc7a";
export *from "#lbkpzw8nphru";
export *from "#768t9nvx4aio";
export *from "#4okrafkbueid";
export *from "#qsb4858ln9g5";
export *from "#o52bosx1o4df";
export *from "#i6fiia6z4x10";
export *from "#2eo44c56ebfi";
export *from "#5j678cbskl2w";
export *from "#s4ylmmgj1kig";
export *from "#wavczpl1zxvg";
export *from "#8sfk4kby98q6";
export *from "#vbkfq413o3u7";
export *from "#26uyycr73i6f";
export *from "#4woymc9xhupl";
export *from "#hu7oo5uup2sj";
export *from "#e5asmvaq7yj0";
export *from "#dxackjk2l9fx";
export *from "#njm93vxresgv";
export *from "#46orcwui6143";

export { default as checkbox } from "#2ne919slwy5h";
export { default as disclosure } from "#7xsqb2bbtamg";
export { default as dropdown } from "#79y0zfcyhzga";
export { default as input } from "#8y47rueq20kg";
export { createKeyValueInputElement, default as key_value_input } from "#0cw58fkldqsp";
export { default as radio } from "#oohgsil8r9co";
export { status_input } from "#ayzv8371lu6f";
export { default as tabs, tab_panel } from "#92vilwel70ga";
export { default as toggle } from "#mfdafbn2tpmz";
export { upload, upload_button } from "#gorq8n1u6vrr";
export {
  default as search,
  search_config_script,
  search_filter,
  search_item,
  search_panel,
  search_query_input,
} from "#xkgew618b00p";
export { default as shared_steps_panel } from "#hpgy4recky69";
export {
  default as wizard,
  wizard_final_action,
  wizard_next_button,
  wizard_previous_button,
} from "#b99m28a51fja";
export *from "#hzrmwbvgt2ax";
export {
  AdvancedContributionsGraph,
  AdvancedGraph,
  AdvancedRoadmap,
  contributions_graph,
  cpu_graph,
  createGraphRoot,
  createServerGraphRoot,
  download_graph,
  gpu_graph,
  graph,
  GraphCard,
  memory_graph,
  roadmap,
  upload_graph,
} from "#wvl9qa853kbz";
export {
  logs_content,
  logs_paged_content,
  logs_stats_breakdown,
  logs_view,
} from "#k7m1w2ythawp";
export {
  live_island_mount,
  LiveIslandMount,
} from "#i6fiia6z4x10";
export type { logs_view_props } from "#k7m1w2ythawp";
export type {
  BackendStatusCheckConfig,
  checkbox_props,
  disclosure_props,
  dropdown_option,
  dropdown_props,
  graph_props,
  InputProps,
  key_value_input_dom_field,
  key_value_input_dom_props,
  key_value_input_field,
  key_value_input_props,
  MatchStatusConfig,
  radio_option,
  radio_props,
  roadmap_group,
  roadmap_item,
  roadmap_props,
  status_input_props,
  tab_panel_props,
  tabs_item,
  tabs_props,
  toggle_option,
  toggle_props,
  UploadButtonProps,
  UploadProps,
} from "./advanced-types.js";
export type {
  SearchFilterProps,
  SearchItemProps,
  SearchQueryInputProps,
  search_filter_node,
  search_panel_props,
  search_props,
} from "#xkgew618b00p";
export type { SharedStepsPanelProps } from "#hpgy4recky69";
export type {
  wizard_nav_button_props,
  wizard_props,
  wizard_step,
} from "#b99m28a51fja";
