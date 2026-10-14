import { applyA11ySettings, configureA11yDefaults, getA11ySettings, onSystemA11yChange, registerA11ySync, setA11yCookieEnabled } from "./apply.js";
import { bindA11yControls, syncA11yControls } from "./controls.js";
import { getFrontendA11y } from "./config.js";
import { runA11yEffects } from "./effects.js";

import type { A11yLabels } from "./controls.js";
import type { BindRoot } from "./../dom/index.js";

type A11yRuntimeOptions = {
  cookie?: boolean;
  defaults?: unknown;
  labels?: A11yLabels;
};

let watching = false;

function bindA11yRuntime(root: BindRoot = document, options: A11yRuntimeOptions = {}): void {
  const config = getFrontendA11y();
  configureA11yDefaults(options.defaults === undefined ? config.defaults : options.defaults);
  setA11yCookieEnabled(options.cookie === undefined ? config.cookie : options.cookie === true);
  if (!watching) {
    watching = true;
    registerA11ySync((resolved) => {
        runA11yEffects(resolved);
        syncA11yControls(document);
    });
    onSystemA11yChange();
  }
  runA11yEffects(applyA11ySettings(getA11ySettings()));
  bindA11yControls(root, options.labels);
  if (typeof window !== "undefined") {
    window.requestAnimationFrame(() => syncA11yControls(document));
  }
}

export { bindA11yRuntime };
export type { A11yRuntimeOptions };
