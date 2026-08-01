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
