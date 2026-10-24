import { DEFAULT_LINK_ICON, normalizeLinksConfig } from "./../config/links.js";
import { LOCALE_HANDOFF_QUERY } from "./../language/routing/boot.js";

import type {
  FrontendLinksConfig,
  NormalizedFrontendLinkGroup,
  NormalizedFrontendLinkMessages,
  NormalizedFrontendLinksConfig,
} from "./../config/types/links.js";
import type { SiteLink } from "./components/site/link.js";

type SiteLinksOptions = {
  origins?: Record<string, string>;
  set: string;
};

type SiteLinksFooterGroup = { heading: string; key: string; links: SiteLink[] };

type SiteLinksFooter = {
  columns: { groups: SiteLinksFooterGroup[]; key: string }[];
  note: SiteLink[];
  site: SiteLink[];
};

type ResolvedSiteLinks = {
  footer: SiteLinksFooter;
  header: SiteLink[];
};

type State = { config: NormalizedFrontendLinksConfig; origins: Record<string, string>; set: string };

type Scope = { locale: string; messages: NormalizedFrontendLinkMessages; state: State };

let configured: State | null = null;

function configureSiteLinks(config: FrontendLinksConfig, options: SiteLinksOptions): void {
  const normalized = normalizeLinksConfig(config);
  if (!normalized) {
    configured = null;
    return;
  }
  if (!normalized.sets[options.set]) throw new Error(`site-links :: no set named "${options.set}" in the links config`);
  configured = { config: normalized, origins: options.origins || {}, set: options.set };
}

function siteLinksIcon(): string {
  return configured?.config.icon || DEFAULT_LINK_ICON;
}

function messagesFor(config: NormalizedFrontendLinksConfig, locale: string): NormalizedFrontendLinkMessages {
  const [language = ""] = locale.toLowerCase().split("-");
  return config.messages[locale] || config.messages[language] || (Object.values(config.messages)[0] as NormalizedFrontendLinkMessages);
}

function hrefFor({ locale, state }: Scope, key: string): string {
  const link = state.config.links[key]!;
  const site = state.config.sets[state.set]!.site;
  const origin = state.origins[link.site];
  if (!link.site || link.site === site || !origin) return link.href;
  const url = new URL(link.href, origin);
  if (locale) url.searchParams.set(LOCALE_HANDOFF_QUERY, locale);
  return url.toString();
}

function linkFor(scope: Scope, key: string): SiteLink {
  return {
    description: scope.messages.descriptions[key],
    external: scope.state.config.links[key]!.external,
    href: hrefFor(scope, key),
    key,
    label: scope.messages.links[key]!,
  };
}

function categoryLinks(scope: Scope, category: string): SiteLink[] {
  return (scope.state.config.categories[category] || []).map((key) => linkFor(scope, key));
}

function groupFor(scope: Scope, group: NormalizedFrontendLinkGroup): SiteLink {
  const sitemap = scope.state.config.sets[scope.state.set]!.sitemap;
  return {
    key: group.group,
    label: scope.messages.groups[group.group]!,
    links: group.sitemap
    ? sitemap.map((category) => ({ key: category, label: scope.messages.categories[category]!, links: categoryLinks(scope, category) }))
    : group.links.map((key) => linkFor(scope, key)),
    search: group.search,
  };
}

function resolveSiteLinks(locale: string): ResolvedSiteLinks | null {
  if (!configured) return null;
  const scope: Scope = { locale, messages: messagesFor(configured.config, locale), state: configured };
  const set = configured.config.sets[configured.set]!;
  return {
    footer: {
      columns: set.footer.columns.map((column, index) => ({
            groups: column.map((category) => ({
                  heading: scope.messages.categories[category]!,
                  key: category,
                  links: categoryLinks(scope, category),
            })),
            key: String(index),
      })),
      note: set.footer.note.map((key) => linkFor(scope, key)),
      site: set.footer.site.map((key) => linkFor(scope, key)),
    },
    header: set.header.map((item) => (typeof item === "string" ? linkFor(scope, item) : groupFor(scope, item))),
  };
}

export { configureSiteLinks, resolveSiteLinks, siteLinksIcon };
export type { ResolvedSiteLinks, SiteLinksFooter, SiteLinksFooterGroup, SiteLinksOptions };
