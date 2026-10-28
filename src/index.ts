import {
  bindActionButtons,
  bindActionForms,
  bindActionTriggers,
  bindCopyButtons,
} from "./actions/index.js";

import type { ActionAdapters } from "./actions/index.js";
import { actionAdapters, localeRuntimeOptions } from "./runtime/options.js";
import { bindA11yRuntime } from "./a11y/runtime.js";
import type { A11yRuntimeOptions } from "./a11y/runtime.js";
import { bindAdvancedInputControllers } from "./inputs/advanced/index.js";
import { bindInputControllers } from "./inputs/index.js";
import {
  bindLocaleSwitchers,
  type LocaleRuntimeOptions,
  type SourceLanguageRuntimeOptions,
} from "./language/index.js";

import { bindIcons, type IconRuntimeOptions } from "./icons/index.js";
import { bindLayouts, type LayoutRuntimeOptions } from "./layout/index.js";
import type { LiveSubscribe } from "./live/index.js";
import { bindLazySystems } from "./runtime/lazy.js";
import { setSpaRebind } from "./spa/config.js";
import { bindSoftRedirectLinks } from "./spa/index.js";
import { bindModals } from "./modal/index.js";
import { bindPopovers } from "./popover/index.js";
import { bindPrimitiveControllers } from "./primitives/index.js";
import { bindReveals, type RevealOptions } from "./reveal/index.js";
import { bindFrost } from "./frost/index.js";
import { type ProgressBindOptions, type ProgressHandle } from "./progress/index.js";
import { bindSidebars, type SidebarRuntimeOptions } from "./sidebar/index.js";
import { bindThemeRuntime, type ThemeRuntimeOptions } from "./theme/index.js";
import { bindTooltips } from "./tooltip/index.js";
import { bindPortals, ensureLayerRoot } from "./layer/index.js";
import { bindWizard } from "./wizard/index.js";
import { bindRoot as resolveRootScope, type BindRoot, type Cleanup } from "./dom/index.js";
import { collectAddedBindRoots } from "./dom/binding.js";
import { flash } from "./flash/index.js";
import { bindFrontendGlobals } from "./runtime/globals.js";
import { progress } from "./progress/index.js";
import {
  resolveFrontendLogger,
  type FrontendLoggingOptions,
} from "./logging/index.js";

type FrontendRuntimeAdapters = ActionAdapters&FrontendLoggingOptions& {
  progress?: ProgressHandle;
  sidebarPersistence?: SidebarRuntimeOptions["persistence"];
  themePersistence?: ThemeRuntimeOptions["persistence"];
  subscribe?: LiveSubscribe;
};

type FrontendRuntimeOptions = {
  a11y?: A11yRuntimeOptions;
  adapters?: FrontendRuntimeAdapters;
  reveal?: RevealOptions | false;
  frontend_quiet?: boolean;
  icons?: IconRuntimeOptions;
  layout?: LayoutRuntimeOptions;
  locale?: LocaleRuntimeOptions;
  observe?: boolean;
  progress?: ProgressBindOptions;
  quiet?: boolean;
  sidebar?: SidebarRuntimeOptions;
  sourceLanguage?: SourceLanguageRuntimeOptions;
  theme?: Omit<ThemeRuntimeOptions, "persistence">;
};

type FrontendRuntimeBinding = {
  disconnect: Cleanup;
  root: BindRoot;
};

function bindFrontendShell(scope: BindRoot, options: FrontendRuntimeOptions) {
  bindA11yRuntime(scope, options.a11y || {});
  void bindThemeRuntime(scope, {
      ...(options.theme || {}),
      persistence: options.adapters?.themePersistence,
  });
  bindLayouts(scope, options.layout || {});
  ensureLayerRoot();
  bindPortals(scope);
  bindSidebars(scope, {
      ...(options.sidebar || {}),
      persistence: options.adapters?.sidebarPersistence || options.sidebar?.persistence,
  });
}

type BindStepLogger = ReturnType<typeof resolveFrontendLogger>;

function runBindStep(logger: BindStepLogger, label: string, step: () => void) {
  try {
    step();
  } catch (error) {
    logger.warn("runtime", "bind-step-failed", {
        error: error instanceof Error ? error.message : String(error),
        step: label,
    });
  }
}

function bindFrontendWidgets(
  scope: BindRoot,
  options: FrontendRuntimeOptions,
  adapters: ActionAdapters& { subscribe?: LiveSubscribe },
) {
  const logger = resolveFrontendLogger({
      ...options.adapters,
      frontend_quiet: options.frontend_quiet,
      quiet: options.quiet,
  });
  runBindStep(logger, "icons", () => bindIcons(scope, options.icons || {}));
  runBindStep(logger, "locale", () => bindLocaleSwitchers(scope, localeRuntimeOptions(options, adapters)));
  bindLazySystems(scope, { sourceLanguage: options.sourceLanguage, subscribe: adapters.subscribe }, (label, step) => {
      step().catch ((error: unknown) => logger.warn("runtime", "bind-step-failed", {
            error: error instanceof Error ? error.message : String(error),
            step: label,
      }));
  });
  runBindStep(logger, "inputs", () => bindInputControllers(scope, {
        flash: adapters.flash,
        logging: {
          ...options.adapters,
          frontend_quiet: options.frontend_quiet,
          quiet: options.quiet,
        },
  }));
  runBindStep(logger, "advancedInputs", () => bindAdvancedInputControllers(scope));
  runBindStep(logger, "primitives", () => bindPrimitiveControllers(scope));
  runBindStep(logger, "wizard", () => bindWizard(scope));
  runBindStep(logger, "tooltips", () => bindTooltips(scope));
  runBindStep(logger, "popovers", () => bindPopovers(scope));
  runBindStep(logger, "modals", () => bindModals(scope));
  runBindStep(logger, "softRedirectLinks", () => bindSoftRedirectLinks(scope));
  runBindStep(logger, "actionTriggers", () => bindActionTriggers(scope, { navigation: adapters.navigation }));
  runBindStep(logger, "actionForms", () => bindActionForms(scope, { adapters }));
  runBindStep(logger, "actionButtons", () => bindActionButtons(scope, { adapters }));
  runBindStep(logger, "copyButtons", () => bindCopyButtons(scope));
  runBindStep(logger, "frost", () => bindFrost(scope));
  if (options.reveal !== false) {
    runBindStep(logger, "reveals", () => bindReveals(scope, options.reveal || {}));
  }
}

function bindFrontendRuntimeOnce(root: BindRoot, options: FrontendRuntimeOptions) {
  const scope = resolveRootScope(root);
  const adapters = actionAdapters(options);
  bindFrontendShell(scope, options);
  const logger = resolveFrontendLogger({
      ...options.adapters,
      frontend_quiet: options.frontend_quiet,
      quiet: options.quiet,
  });
  bindFrontendGlobals(scope, options, (label, step) => runBindStep(logger, label, step));
  bindFrontendWidgets(scope, options, adapters);
}

function bindFrontendRuntime(
  root: BindRoot = document,
  options: FrontendRuntimeOptions = {},
): FrontendRuntimeBinding {
  const scope = resolveRootScope(root);
  const logger = resolveFrontendLogger({
      ...options.adapters,
      frontend_quiet: options.frontend_quiet,
      quiet: options.quiet,
  });
  setSpaRebind((nextRoot) => bindFrontendRuntimeOnce(nextRoot, options));
  bindFrontendRuntimeOnce(scope, options);
  logger.info("runtime", "bound", {
      observe: options.observe !== false,
  });
  let observer: MutationObserver | null = null;
  if (options.observe !== false && typeof MutationObserver === "function") {
    observer = new MutationObserver((records) => {
        collectAddedBindRoots(records).forEach((node) => bindFrontendRuntimeOnce(node, options));
    });
    const target = scope instanceof Document ? scope.documentElement : scope;
    observer.observe(target, { childList: true, subtree: true });
  }
  return {
    disconnect() {
      setSpaRebind(null);
      observer?.disconnect();
      logger.info("runtime", "disconnected");
    },
    root: scope,
  };
}

export { bindFrontendRuntime };

export type {
  FrontendLoggingOptions,
  FrontendRuntimeAdapters,
  FrontendRuntimeBinding,
  FrontendRuntimeOptions,
};

export *from "./entries/root/01.js";

export *from "./entries/root/02.js";

export *from "./entries/root/03.js";
