import { bindActionButtons, bindActionForms, bindActionTriggers } from "./actions/index.js";
import type { ActionAdapters } from "./actions/index.js";
import { bindInputControllers } from "./inputs/index.js";
import { bindIcons } from "./icons/index.js";
import { bindFullscreen } from "./fullscreen/index.js";
import { bindLiveRefresh, rehydrate, type LiveOptions } from "./live/index.js";
import { bindModals } from "./modal/index.js";
import { bindPopovers } from "./popover/index.js";
import { bindProgress, type ProgressHandle } from "./progress/index.js";
import { bindThemeRuntime, type ThemeRuntimeOptions } from "./theme/index.js";
import { bindTooltips } from "./tooltip/index.js";
import { bindPortals, ensureLayerRoot } from "./layer/index.js";
import type { BindRoot, Cleanup } from "./dom/index.js";
import { flash } from "./flash/index.js";
import { progress } from "./progress/index.js";
import {
  resolveFrontendLogger,
  type FrontendLoggingOptions,
} from "./logging/index.js";

type FrontendRuntimeAdapters = ActionAdapters & FrontendLoggingOptions & {
  progress?: ProgressHandle;
  themePersistence?: ThemeRuntimeOptions["persistence"];
  live?: LiveOptions["skip"];
};

type FrontendRuntimeOptions = {
  adapters?: FrontendRuntimeAdapters;
  frontend_quiet?: boolean;
  live?: Omit<LiveOptions, "skip">;
  observe?: boolean;
  quiet?: boolean;
  theme?: Omit<ThemeRuntimeOptions, "persistence">;
};

type FrontendRuntimeBinding = {
  disconnect: Cleanup;
  root: BindRoot;
};

function rootScope(root: BindRoot | null | undefined): BindRoot {
  return root && "querySelectorAll" in root ? root : document;
}

function actionAdapters(options: FrontendRuntimeOptions): ActionAdapters {
  const adapters = options.adapters || {};
  return {
    ...adapters,
    flash: (adapters.flash || flash) as ActionAdapters["flash"],
    progress: adapters.progress || progress,
  };
}

function bindFrontendRuntimeOnce(root: BindRoot, options: FrontendRuntimeOptions) {
  const scope = rootScope(root);
  const adapters = actionAdapters(options);
  void bindThemeRuntime(scope, {
    ...(options.theme || {}),
    persistence: options.adapters?.themePersistence,
  });
  ensureLayerRoot();
  bindPortals(scope);
  bindProgress();
  bindIcons(scope);
  bindInputControllers(scope, {
    flash: adapters.flash,
    logging: {
      ...options.adapters,
      frontend_quiet: options.frontend_quiet,
      quiet: options.quiet,
    },
  });
  bindTooltips(scope);
  bindPopovers(scope);
  bindModals(scope);
  bindActionTriggers(scope, { navigation: adapters.navigation });
  bindActionForms(scope, { adapters });
  bindActionButtons(scope, { adapters });
  bindFullscreen(scope);
  bindLiveRefresh(scope, {
    ...(options.live || {}),
    bind(nextRoot) {
      bindFrontendRuntimeOnce(nextRoot, options);
      options.live?.bind?.(nextRoot);
    },
    skip: options.adapters?.live,
  });
}

function bindFrontendRuntime(
  root: BindRoot = document,
  options: FrontendRuntimeOptions = {},
): FrontendRuntimeBinding {
  const scope = rootScope(root);
  const logger = resolveFrontendLogger({
    ...options.adapters,
    frontend_quiet: options.frontend_quiet,
    quiet: options.quiet,
  });
  bindFrontendRuntimeOnce(scope, options);
  logger.info("runtime", "bound", {
    observe: options.observe !== false,
  });
  let observer: MutationObserver | null = null;
  if (options.observe !== false && typeof MutationObserver === "function") {
    observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element || node instanceof DocumentFragment) {
            bindFrontendRuntimeOnce(node, options);
          }
        });
      });
    });
    const target = scope instanceof Document ? scope.documentElement : scope;
    observer.observe(target, { childList: true, subtree: true });
  }
  return {
    disconnect() {
      observer?.disconnect();
      logger.info("runtime", "disconnected");
    },
    root: scope,
  };
}

export { bindFrontendRuntime, rehydrate };
export type {
  FrontendLoggingOptions,
  FrontendRuntimeAdapters,
  FrontendRuntimeBinding,
  FrontendRuntimeOptions,
};
export * from "./actions/index.js";
export * from "./dom/index.js";
export * from "./flash/index.js";
export * from "./fullscreen/index.js";
export * from "./http/index.js";
export * from "./icons/index.js";
export * from "./inputs/index.js";
export * from "./layer/index.js";
export * from "./live/index.js";
export * from "./modal/index.js";
export * from "./popover/index.js";
export * from "./progress/index.js";
export * from "./react/index.js";
export * from "./theme/index.js";
export * from "./tooltip/index.js";
