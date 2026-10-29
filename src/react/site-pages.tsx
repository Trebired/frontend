import { createContext, useContext, type ComponentType, type ReactNode } from "react";

import { ERROR_STATUSES, errorRoutePath } from "./../error/paths.js";
import { currentRoutePath, stripLocalePrefix } from "./../language/routing/runtime.js";
import { frontendDataAttr } from "./../namespace/index.js";
import { mountLiveIsland } from "./index.js";
import { LocaleProvider } from "./locale.js";

type SitePage = ComponentType;

type SitePageLoader = () => Promise<SitePage>;

type SitePageLoaders = Readonly<Record<string, SitePageLoader>> | ((route: string) => SitePageLoader | undefined);

type SitePagesOptions = {
  error: ComponentType<{ status: number }>;
  pages: SitePageLoaders;
  wrap?: (page: ReactNode, route: string) => ReactNode;
};

type SitePageContent = (props: { path: string }) => ReactNode;

type SitePages = {
  mountPages: (rootId: string) => Promise<unknown>;
  PageContent: SitePageContent;
  preparePage: (path: string) => Promise<void>;
};

const PageRouteContext = createContext("/");

function usePageRoute(): string {
  return useContext(PageRouteContext);
}

function sitePageRoute(path: string): string {
  const trimmed = String(path || "/").replace(/\/+$/u, "");
  return trimmed || "/";
}

function errorStatusOf(route: string): number | undefined {
  return ERROR_STATUSES.find((status) => errorRoutePath(status) === route);
}

function linkRoute(target: EventTarget | null): string {
  const link = target instanceof Element ? target.closest(`a[${frontendDataAttr("soft-redirect")}]`) : null;
  const href = link?.getAttribute("href");
  if (!href) return "";
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin ? stripLocalePrefix(url.pathname) : "";
}

function createPageLoader(pages: SitePageLoaders) {
  const loaded = new Map<string, SitePage>();
  const pending = new Map<string, Promise<void>>();
  const loaderFor = (route: string) => (typeof pages === "function" ? pages(route) : pages[route]);

  function preparePage(path: string): Promise<void> {
    const route = sitePageRoute(path);
    const loader = loaded.has(route) || errorStatusOf(route) ? undefined : loaderFor(route);
    if (!loader) return Promise.resolve();
    const known = pending.get(route);
    if (known) return known;
    const loading = loader().then((page) => {
        loaded.set(route, page);
      }, (error: unknown) => {
        pending.delete(route);
        throw error;
    });
    pending.set(route, loading);
    return loading;
  }

  return { loaded, preparePage };
}

function mountSitePages(rootId: string, PageContent: SitePageContent, preparePage: SitePages["preparePage"]) {
  let preparedPath = "";
  const prefetch = (event: Event) => {
    const route = linkRoute(event.target);
    if (route) preparePage(route).catch(() => undefined);
  };

  function PageIsland() {
    return <PageContent path={preparedPath || currentRoutePath()} />;
  }

  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
  return mountLiveIsland({
      component: PageIsland,
      prepare: ({ url }) => {
        preparedPath = stripLocalePrefix(new URL(url, window.location.href).pathname);
        return preparePage(preparedPath);
      },
      root: rootId,
      wrap: (node: ReactNode) => <LocaleProvider>{node}</LocaleProvider>,
  });
}

function createSitePages(options: SitePagesOptions): SitePages {
  const { loaded, preparePage } = createPageLoader(options.pages);

  function PageContent({ path }: { path: string }) {
    const route = sitePageRoute(path);
    const ErrorPage = options.error;
    const status = errorStatusOf(route);
    if (status) return <ErrorPage status={status} />;
    const Page = loaded.get(route);
    if (!Page) return <ErrorPage status={404} />;
    const page = <PageRouteContext.Provider value={route}><Page /></PageRouteContext.Provider>;
    return options.wrap ? options.wrap(page, route) : page;
  }

  return { mountPages: (rootId) => mountSitePages(rootId, PageContent, preparePage), PageContent, preparePage };
}

export { createSitePages, usePageRoute };
export type { SitePage, SitePageContent, SitePageLoader, SitePageLoaders, SitePages, SitePagesOptions };
