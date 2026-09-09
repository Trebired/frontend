import { matchLocale } from "./options.js";
import type { LocaleRouting } from "./options.js";

type ParsedLocalePathname = {
  locale: string;
  pathname: string;
  prefixed: boolean;
};

type LocaleShellRoute = {
  locale: string;
  outFile: string;
  path: string;
  sourcePath: string;
};

function normalizePathname(input: unknown): string {
  const raw = String(input ?? "") || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  if (withSlash.length === 1) return "/";
  return withSlash.replace(/\/+$/u, "") || "/";
}

function parseLocalePathname(pathname: unknown, routing: LocaleRouting): ParsedLocalePathname {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/");
  const candidate = matchLocale(segments[1], routing);
  if (!candidate) return { locale: routing.defaultLocale, pathname: normalized, prefixed: false };
  return {
    locale: candidate,
    pathname: normalizePathname(`/${segments.slice(2).join("/")}`),
    prefixed: true,
  };
}

function buildLocalePathname(pathname: unknown, locale: unknown, routing: LocaleRouting): string {
  const base = normalizePathname(pathname);
  const target = matchLocale(locale, routing) || routing.defaultLocale;
  if (target === routing.defaultLocale) return base;
  return base === "/" ? `/${target}` : `/${target}${base}`;
}

function localeShellOutFile(pathname: unknown): string {
  const normalized = normalizePathname(pathname);
  return normalized === "/" ? "index.html" : `${normalized.slice(1)}/index.html`;
}

function localeShellRoutes(
  paths: readonly string[],
  routing: LocaleRouting,
): LocaleShellRoute[] {
  const routes: LocaleShellRoute[] = [];
  for (const locale of routing.locales) {
    for (const source of paths) {
      const path = buildLocalePathname(source, locale, routing);
      routes.push({ locale, outFile: localeShellOutFile(path), path, sourcePath: normalizePathname(source) });
    }
  }
  return routes;
}

export {
  buildLocalePathname,
  localeShellOutFile,
  localeShellRoutes,
  normalizePathname,
  parseLocalePathname,
};
export type { LocaleShellRoute, ParsedLocalePathname };
