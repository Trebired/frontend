import {
  createRoot,
  type Root,
} from "react-dom/client";

type ReactRootCache = WeakMap<HTMLElement, Root>;

function getOrCreateReactRoot(
  roots: ReactRootCache,
  container: HTMLElement | null,
) {
  if (!(container instanceof HTMLElement)) return null;
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  return root;
}

function deleteReactRoot(
  roots: ReactRootCache,
  container: HTMLElement | null,
) {
  if (container instanceof HTMLElement) roots.delete(container);
}

export { deleteReactRoot, getOrCreateReactRoot };
export type { ReactRootCache };
