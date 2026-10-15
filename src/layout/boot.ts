import { createLocaleBootScript } from "./../language/routing/boot.js";
import type { LocaleBootOptions } from "./../language/routing/boot.js";
import type { LocaleRoutingOptions } from "./../language/routing/options.js";
import { createScrollStateBootScript } from "./scroll.js";
import type { ScrollStateOptions } from "./scroll.js";
import { createSiteHeaderToneScript } from "./header/tone.js";

type FrontendBootLocale = LocaleBootOptions& { routing?: LocaleRoutingOptions };

type FrontendBootOptions = {
  header?: boolean;
  locale?: FrontendBootLocale | false;
  scroll?: ScrollStateOptions | boolean;
};

type FrontendBootScripts = {
  bodyScripts: string[];
  bootScripts: string[];
};

function localeScript(locale: FrontendBootLocale): string {
  const { routing, ...boot } = locale;
  return createLocaleBootScript(routing || {}, boot);
}

function frontendBoot(options: FrontendBootOptions = {}): FrontendBootScripts {
  const bootScripts: string[] = [];
  const bodyScripts: string[] = [];

  if (options.scroll !== false) {
    bootScripts.push(createScrollStateBootScript(options.scroll === true ? {} : options.scroll || {}));
  }
  if (options.locale) bootScripts.push(localeScript(options.locale));
  if (options.header !== false) bodyScripts.push(createSiteHeaderToneScript());

  return { bodyScripts, bootScripts };
}

export { frontendBoot };
export type { FrontendBootOptions, FrontendBootScripts };
