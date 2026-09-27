import { createLocaleDocumentBody } from "./document.js";
import { localePathFor, prefixesEveryLocale } from "./options.js";
import type { LocaleRouting, LocaleStrategy } from "./options.js";
import type { LocaleMeta } from "./view.js";

type LocaleShellRoutesOptions<M extends LocaleMeta> = {
  meta: (path: string, locale: string) => M;
  paths: readonly string[];
  render: (path: string, locale: string) => string;
  routing: LocaleRouting;
  strategy?: LocaleStrategy;
};

type LocaleShellRoute<M extends LocaleMeta> = {
  body: string;
  locale: string;
  meta: M& { lang: string };
  path: string;
  sourcePath: string;
};

function localeRoutePath(
  sourcePath: string,
  locale: string,
  routing: LocaleRouting,
  strategy?: LocaleStrategy,
): string {
  return localePathFor(sourcePath, locale, { ...routing, strategy: strategy || routing.strategy });
}

function servedLocales(routing: LocaleRouting, strategy?: LocaleStrategy): string[] {
  const prefixed = strategy === "prefix" || prefixesEveryLocale(strategy);
  return prefixed ? routing.locales : [routing.defaultLocale];
}

/* Under prefix-all the default locale also lives behind a prefix, so the bare
   path is emitted alongside it and keeps every link written before the switch
   resolving to the same page. */
function servedPaths(
  sourcePath: string,
  locale: string,
  routing: LocaleRouting,
  strategy?: LocaleStrategy,
): string[] {
  const prefixed = localeRoutePath(sourcePath, locale, routing, strategy);
  if (!prefixesEveryLocale(strategy) || locale !== routing.defaultLocale) return [prefixed];
  const bare = sourcePath.replace(/\/+$/u, "") || "/";
  return bare === prefixed ? [prefixed] : [prefixed, bare];
}

function swapMeta<M extends LocaleMeta>(metas: Record<string, M>): Record<string, LocaleMeta> {
  const entries = Object.entries(metas).map(([locale, meta]) => [locale, { description: meta.description, title: meta.title }]);
  return Object.fromEntries(entries);
}

function createLocaleShellRoutes<M extends LocaleMeta>(options: LocaleShellRoutesOptions<M>): LocaleShellRoute<M>[] {
  const { routing } = options;
  const routes: LocaleShellRoute<M>[] = [];
  for (const sourcePath of options.paths) {
    const bodies = Object.fromEntries(routing.locales.map((locale) => [locale, options.render(sourcePath, locale)]));
    const metas: Record<string, M> = Object.fromEntries(
      routing.locales.map((locale) => [locale, options.meta(sourcePath, locale)]),
    );
    for (const locale of servedLocales(routing, options.strategy)) {
      for (const path of servedPaths(sourcePath, locale, routing, options.strategy)) {
        routes.push({
            body: createLocaleDocumentBody({ bodies, defaultLocale: locale, meta: swapMeta(metas) }),
            locale,
            meta: { ...metas[locale], lang: locale },
            path,
            sourcePath,
        });
      }
    }
  }
  return routes;
}

export { createLocaleShellRoutes };
export type { LocaleShellRoute, LocaleShellRoutesOptions };
