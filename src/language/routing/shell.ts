import { createLocaleDocumentBody } from "./document.js";
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

function localeRoutePath(sourcePath: string, locale: string, routing: LocaleRouting): string {
  if (locale === routing.defaultLocale) return sourcePath;
  const trimmed = sourcePath.replace(/\/+$/u, "");
  return trimmed ? `/${locale}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}` : `/${locale}`;
}

function servedLocales(routing: LocaleRouting, strategy?: LocaleStrategy): string[] {
  return strategy === "prefix" ? routing.locales : [routing.defaultLocale];
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
      routes.push({
          body: createLocaleDocumentBody({ bodies, defaultLocale: locale, meta: swapMeta(metas) }),
          locale,
          meta: { ...metas[locale], lang: locale },
          path: localeRoutePath(sourcePath, locale, routing),
          sourcePath,
      });
    }
  }
  return routes;
}

export { createLocaleShellRoutes };
export type { LocaleShellRoute, LocaleShellRoutesOptions };
