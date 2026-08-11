import {
  onReady,
  queryAll,
  type BindRoot,
  type Cleanup,
} from "#er0dlx1gtbzh";

type ElementBindHandler = (host: HTMLElement) => void;
type ChildElementBindHandler = (child: HTMLElement | null) => void;
type ChildFormBindHandler = (child: HTMLFormElement | null) => void;

type ElementBindingOptions = {
  observe?: boolean;
  root?: BindRoot | null;
};

type ElementBinding = {
  bind: (root?: BindRoot | null) => number;
  disconnect: Cleanup;
};

function firstHTMLElementChild(host: Element | null | undefined) {
  const child = host?.firstElementChild || null;
  return child instanceof HTMLElement ? child : null;
}

function firstHTMLButtonChild(host: Element | null | undefined) {
  const match = Array.from(host?.children || []).find((child) => {
      return child instanceof HTMLButtonElement;
  });
  return match instanceof HTMLButtonElement ? match : null;
}

function firstHTMLFormChild(host: Element | null | undefined) {
  const child = host?.firstElementChild || null;
  return child instanceof HTMLFormElement ? child : null;
}

function observeTarget(root: BindRoot) {
  return root instanceof Document ? root.documentElement : root;
}

function bindElements(
  selector: string,
  handler: ElementBindHandler,
  options: ElementBindingOptions = {},
): ElementBinding {
  const bound = new WeakSet<HTMLElement>();
  const root = options.root || document;
  const bind = (scope: BindRoot | null = root) => {
    let count = 0;
    queryAll<HTMLElement>(scope || root, selector).forEach((host) => {
        if (bound.has(host)) return;
        bound.add(host);
        handler(host);
        count += 1;
    });
    return count;
  };
  bind(root);
  const observer =
  options.observe === false || typeof MutationObserver !== "function"
  ? null
  : new MutationObserver((records) => {
      records.forEach((record) => {
          record.addedNodes.forEach((node) => {
              if (node instanceof Element || node instanceof DocumentFragment) {
                bind(node);
              }
          });
      });
  });
  observer?.observe(observeTarget(root), { childList: true, subtree: true });
  return {
    bind,
    disconnect() {
      observer?.disconnect();
    },
  };
}

function bindElementsOnReady(
  selector: string,
  handler: ElementBindHandler,
  options: ElementBindingOptions = {},
) {
  let binding: ElementBinding | null = null;
  onReady(() => {
      binding = bindElements(selector, handler, options);
  });
  return {
    disconnect() {
      binding?.disconnect();
    },
  };
}

function bindFirstChildElements(
  selector: string,
  handler: ChildElementBindHandler,
  options: ElementBindingOptions = {},
) {
  return bindElementsOnReady(selector, (host) => {
      handler(firstHTMLElementChild(host));
    }, options);
}

function bindFirstChildFormElements(
  selector: string,
  handler: ChildFormBindHandler,
  options: ElementBindingOptions = {},
) {
  return bindElementsOnReady(selector, (host) => {
      handler(firstHTMLFormChild(host));
    }, options);
}

export {
  bindElements,
  bindElementsOnReady,
  bindFirstChildElements,
  bindFirstChildFormElements,
  firstHTMLButtonChild,
  firstHTMLElementChild,
  firstHTMLFormChild,
};
export type {
  ChildElementBindHandler,
  ChildFormBindHandler,
  ElementBindHandler,
  ElementBinding,
  ElementBindingOptions,
};
