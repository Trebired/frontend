import {
  bindActionButtons,
  bindActionForms,
  bindActionTriggers,
  bindCopyButtons,
} from "./actions/index.js";
import { bindCodeBlocks } from "./code/index.js";
import { bindEditors } from "./editor/index.js";
import type { ActionAdapters } from "./actions/index.js";
import { bindAdvancedInputControllers } from "./inputs/advanced/index.js";
import { bindInputControllers } from "./inputs/index.js";
import {
  bindLocaleSwitchers,
  bindSourceLanguageRuntime,
  type LocaleRuntimeOptions,
  type SourceLanguageRuntimeOptions,
} from "./language/index.js";
import { bindIcons, type IconRuntimeOptions } from "./icons/index.js";
import { bindFullscreen } from "./fullscreen/index.js";
import { bindGraphs } from "./graph/index.js";
import { bindLayouts, type LayoutRuntimeOptions } from "./layout/index.js";
import { bindLiveCards, bindLiveLists, type LiveSubscribe } from "./live/index.js";
import { bindScrollOverflows } from "./primitives/scroll-overflow.js";
import { setSpaRebind } from "./spa/config.js";
import { spaNavigationAdapter, softReload } from "./spa/index.js";
import { bindLogsRuntime } from "./logs/index.js";
import { bindModals } from "./modal/index.js";
import { bindPopovers } from "./popover/index.js";
import { bindPrimitiveControllers } from "./primitives/index.js";
import { bindProgress, type ProgressHandle } from "./progress/index.js";
import { bindSidebars, type SidebarRuntimeOptions } from "./sidebar/index.js";
import { bindThemeRuntime, type ThemeRuntimeOptions } from "./theme/index.js";
import { bindTooltips } from "./tooltip/index.js";
import { bindPortals, ensureLayerRoot } from "./layer/index.js";
import { bindWizard } from "./wizard/index.js";
import { bindRoot as resolveRootScope, type BindRoot, type Cleanup } from "./dom/index.js";
import { flash } from "./flash/index.js";
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
  adapters?: FrontendRuntimeAdapters;
  frontend_quiet?: boolean;
  icons?: IconRuntimeOptions;
  layout?: LayoutRuntimeOptions;
  locale?: LocaleRuntimeOptions;
  observe?: boolean;
  quiet?: boolean;
  sidebar?: SidebarRuntimeOptions;
  sourceLanguage?: SourceLanguageRuntimeOptions;
  theme?: Omit<ThemeRuntimeOptions, "persistence">;
};

type FrontendRuntimeBinding = {
  disconnect: Cleanup;
  root: BindRoot;
};

function actionAdapters(options: FrontendRuntimeOptions): ActionAdapters {
  const adapters = options.adapters || {};
  return {
    ...adapters,
    navigation: adapters.navigation || spaNavigationAdapter(),
    reload: adapters.reload || { reload: softReload },
    flash: (adapters.flash || flash) as ActionAdapters["flash"],
    progress: adapters.progress || progress,
  };
}

function localeRuntimeOptions(
  options: FrontendRuntimeOptions,
  adapters: ActionAdapters,
): LocaleRuntimeOptions {
  const locale = options.locale || {};
  if (locale.refresh || !adapters.reload?.reload) return locale;
  return {
    ...locale,
    refresh: () => adapters.reload?.reload?.({
        preserveState: true,
        reason: "locale",
    }),
  };
}

function bindFrontendShell(scope: BindRoot, options: FrontendRuntimeOptions) {
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

function bindFrontendWidgets(
  scope: BindRoot,
  options: FrontendRuntimeOptions,
  adapters: ActionAdapters & { subscribe?: LiveSubscribe },
) {
  bindProgress();
  bindIcons(scope, options.icons || {});
  bindLocaleSwitchers(scope, localeRuntimeOptions(options, adapters));
  bindSourceLanguageRuntime(scope, options.sourceLanguage || {});
  bindGraphs(scope);
  bindLogsRuntime(scope);
  bindCodeBlocks(scope);
  bindEditors(scope);
  bindInputControllers(scope, {
      flash: adapters.flash,
      logging: {
        ...options.adapters,
        frontend_quiet: options.frontend_quiet,
        quiet: options.quiet,
      },
  });
  bindAdvancedInputControllers(scope);
  bindPrimitiveControllers(scope);
  bindWizard(scope);
  bindScrollOverflows();
  bindTooltips(scope);
  bindPopovers(scope);
  bindModals(scope);
  bindActionTriggers(scope, { navigation: adapters.navigation });
  bindActionForms(scope, { adapters });
  bindActionButtons(scope, { adapters });
  bindCopyButtons(scope);
  bindFullscreen(scope);
  bindLiveCards(scope, { subscribe: adapters.subscribe });
  bindLiveLists(scope, { subscribe: adapters.subscribe });
}

function bindFrontendRuntimeOnce(root: BindRoot, options: FrontendRuntimeOptions) {
  const scope = resolveRootScope(root);
  const adapters = actionAdapters(options);
  bindFrontendShell(scope, options);
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
export *from "./actions/index.js";
export *from "./code/index.js";
export *from "./dom/index.js";
export *from "./editor/index.js";
export *from "./entity/index.js";
export *from "./explorer/index.js";
export {
  createAnimationFrameQueue,
  dataTokenGroups,
  dataTokens,
  formatLocaleDateTime,
  json,
  normalize,
  objectApi,
  onlyString,
  parseElementObject,
  parseJson,
  separatorSymbol,
  toString,
  typography,
} from "./data/index.js";
export {
  fileObjectExtension,
  isImageFileObject,
} from "./files/index.js";
export *from "./flash/index.js";
export *from "./fullscreen/index.js";
export *from "./graph/index.js";
export *from "./http/index.js";
export *from "./icons/index.js";
export *from "./product/identity.js";
export {
  createNavigationState,
  defaultNavigationState,
  matchesCurrentPath,
  normalizeNavigationHref,
  normalizeNavigationHref as normalizeHref,
  normalizeNavigationPath,
} from "./server/navigation.js";
export *from "./inputs/index.js";
export {
  bindAdvancedCheckboxes,
  bindAdvancedDisclosures,
  bindAdvancedDropdowns,
  bindAdvancedInputControllers,
  bindAdvancedRadios,
  bindAdvancedSearch,
  bindAdvancedTabs,
  bindOwnedTabs,
  bindStaticDropdown,
  checkboxClient,
  createDisclosure,
  createTabs,
  dropdownOptionSelected,
  dropdownOptionValue,
  dropdownRootConfig,
  dropdownManager,
  getDropdownOptions,
  getHidden,
  radioManager,
  resolveNamedDropdownInput,
  searchManager,
  setDropdownLabel,
  setDropdownOptionConfig,
  switchDisclosureEntry,
  syncCheckboxOption,
  syncDropdownHiddenInput,
  syncDropdownHiddenInputs,
  syncFromHidden,
  updateDropdownRootConfig,
  updateEmptyState,
} from "./inputs/advanced/index.js";
export *from "./layer/index.js";
export *from "./language/index.js";
export *from "./layout/index.js";
export *from "./live/index.js";
export *from "./realtime/index.js";
export {
  configureSpa,
  createLiveOverlayState,
  currentPage,
  onPageChange,
  registerPageCleanup,
  rehydrate,
  removeStalePortaledOverlays,
  softRedirect,
  softRefresh,
  softReload,
} from "./spa/index.js";
export type { PageCleanup, SoftRedirectOptions, SpaOptions, SpaPage } from "./spa/index.js";
export *from "./logging/index.js";
export *from "./logs/index.js";
export *from "./markdown/index.js";
export *from "./media/index.js";
export *from "./modal/index.js";
export *from "./namespace/index.js";
export *from "./popover/index.js";
export *from "./primitives/index.js";
export *from "./progress/index.js";
export *from "./runtime/index.js";
export *from "./sidebar/index.js";
export *from "./settings/index.js";
export *from "./socket/index.js";
export *from "./surface/index.js";
export *from "./theme/index.js";
export *from "./tooltip/index.js";
export {
  bind as bindSearchPanelRuntime,
  bindRoot as bindSearchRoot,
  bindSearchPanel,
  boot as bootSearchPanelRuntime,
  refreshSearchResults,
} from "./search/index.js";
export {
  createSharedStepCard,
  groupSharedSteps,
  renderSharedSteps,
  renderStepsPanel,
  default as stepsController,
} from "./steps/index.js";
export {
  bindWizard,
  bindWizardRoot,
  wizardSteps,
} from "./wizard/index.js";
export type { SearchPanelBinding } from "./search/index.js";
export type { SharedStepCardInput } from "./steps/index.js";
