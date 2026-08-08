import type { ReactNode } from "react";
import { readJsonScript } from "#er0dlx1gtbzh";

type ReactRootOptions = {
  hydrate?: boolean;
};

const roots = new WeakMap<Element, { render: (node: ReactNode) => void; unmount: () => void }>();

async function mountReactRoot(
  root: Element,
  node: ReactNode,
  options: ReactRootOptions = {},
) {
  const client = await import("react-dom/client");
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
  return true;
}

async function mountLiveIsland(options: {
  component: (props: any) => ReactNode;
  initialState?: unknown;
  root: Element | string | null;
  stateId?: string;
}) {
  const target =
    typeof options.root === "string"
      ? document.getElementById(options.root.replace(/^#/, ""))
      : options.root;
  if (!(target instanceof Element)) return null;
  const state = options.stateId
    ? readJsonScript(options.stateId, {})
    : options.initialState || {};
  const react = await import("react");
  const node = react.createElement(options.component, { initialState: state });
  const root = await mountReactRoot(target, node, {
    hydrate: target.childNodes.length > 0,
  });
  target.setAttribute("data-tbf-live-hydrated", "true");
  return root;
}

export {
  mountLiveIsland,
  mountReactRoot,
  readJsonScript,
  renderReactRoot,
  unmountReactRoot,
};
export type { ReactRootOptions };

export * from "#c55llzkpl4ob";
export * from "#nn6lx6ueg6es";
export * from "#gknmswavy1t3";
export * from "#7k5l8ya2kc7a";
export * from "#lbkpzw8nphru";
export * from "#768t9nvx4aio";
export * from "#4okrafkbueid";
export * from "#qsb4858ln9g5";
export * from "#o52bosx1o4df";
export * from "#i6fiia6z4x10";
export * from "#2eo44c56ebfi";
export * from "#5j678cbskl2w";
export * from "#s4ylmmgj1kig";
export * from "#wavczpl1zxvg";
export * from "#8sfk4kby98q6";
export * from "#vbkfq413o3u7";
export * from "#26uyycr73i6f";
export * from "#4woymc9xhupl";
export * from "#hu7oo5uup2sj";
export * from "#e5asmvaq7yj0";

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
export * from "#hzrmwbvgt2ax";
export {
  AdvancedContributionsGraph,
  AdvancedGraph,
  AdvancedRoadmap,
  contributions_graph,
  graph,
  roadmap,
} from "#wvl9qa853kbz";
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
