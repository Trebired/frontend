import { flash } from "./../flash/index.js";
import { progress } from "./../progress/index.js";
import { softReload, spaNavigationAdapter } from "./../spa/index.js";

import type { ActionAdapters } from "./../actions/index.js";
import type { LocaleRuntimeOptions } from "./../language/index.js";
import type { FrontendRuntimeOptions } from "./../index.js";

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

export { actionAdapters, localeRuntimeOptions };
