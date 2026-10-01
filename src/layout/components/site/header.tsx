import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useEffect, useId, useSyncExternalStore } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useSiteHeaderMenu } from "./header_state.js";
import { activeSection, observeSections, serverActiveSection, subscribeActiveSection } from "./section_spy.js";
import { stripLocalePrefix } from "./../../../language/routing/runtime.js";
import { useRenderCurrentUrl } from "./../../../render/current_url.js";

type SiteHeaderLink = {
  active?: boolean;
  href: string;
  key?: string;
  label: ReactNode;
  softRedirect?: boolean;
};

type SiteHeaderLabels = {
  closeMenu?: string;
  home?: string;
  navigation?: string;
  openMenu?: string;
};

type SiteHeaderSurface = "solid" | "transparent" | "blurred";

type SiteHeaderProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  actions?: ReactNode;
  brand: ReactNode;
  brandHref?: false | string;
  labels?: SiteHeaderLabels;
  links?: SiteHeaderLink[];
  menuActions?: ReactNode;
  softRedirect?: boolean;
  surface?: SiteHeaderSurface;
};

const block = "site-header";

function headerPath(value: unknown): string {
  const raw = String(value || "");
  const withoutOrigin = raw.includes("://") ? raw.replace(/^[a-z]+:\/\/[^/]*/iu, "") : raw;
  return (withoutOrigin.split("#")[0].split("?")[0] || "/").replace(/\/+$/u, "") || "/";
}

function headerPathForms(value: unknown): string[] {
  const path = headerPath(value);
  const stripped = stripLocalePrefix(path).replace(/\/+$/u, "") || "/";
  return stripped === path ? [path] : [path, stripped];
}

function pathMatches(currentPath: string, target: string): boolean {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

function linkFragment(link: SiteHeaderLink): string {
  const [, fragment = ""] = String(link.href || "").split("#");
  return fragment;
}

function linkOnCurrentPage(link: SiteHeaderLink, currentPaths: string[]): boolean {
  const targets = headerPathForms(link.href);
  return currentPaths.some((current) => targets.some((target) => pathMatches(current, target)));
}

function linkIsActive(
  link: SiteHeaderLink,
  currentPaths: string[],
  section: string,
  hasSection: boolean,
): boolean {
  if (link.active !== undefined) return link.active;
  const fragment = linkFragment(link);
  if (fragment) return Boolean(section) && fragment === section && linkOnCurrentPage(link, currentPaths);
  if (hasSection && section) return false;
  const targets = headerPathForms(link.href);
  if (targets.includes("/")) return currentPaths.includes("/");
  return currentPaths.some((current) => targets.some((target) => pathMatches(current, target)));
}

function linkAttrs(active: boolean, link: SiteHeaderLink, softRedirect: boolean | undefined) {
  return {
    "aria-current": active ? "page" as const : undefined,
    ...frontendDataAttrs({ "soft-redirect": link.softRedirect ?? softRedirect ? "" : undefined }),
  };
}

function SiteHeaderLinks(props: {
    element: string;
    links: SiteHeaderLink[];
    onNavigate?: () => void;
    softRedirect?: boolean;
    tabIndex?: number;
}) {
  const currentPaths = headerPathForms(useRenderCurrentUrl());
  const fragments = props.links
  .filter((link) => linkFragment(link) && linkOnCurrentPage(link, currentPaths))
  .map((link) => linkFragment(link));
  const fragmentKey = fragments.join("|");
  useEffect(() => {
      observeSections(fragmentKey ? fragmentKey.split("|") : []);
    }, [fragmentKey]);
  const section = useSyncExternalStore(subscribeActiveSection, activeSection, serverActiveSection);
  const hasSection = fragments.length > 0;
  return (
    <>
    {props.links.map((link) => (
          <a
          {...linkAttrs(linkIsActive(link, currentPaths, section, hasSection), link, props.softRedirect)}
          className={classNames(
              frontendElementClass(block, props.element),
              linkIsActive(link, currentPaths, section, hasSection) ? `${frontendElementClass(block, props.element)}--active` : "",
          )}
          href={link.href}
          key={link.key || link.href}
          onClick={props.onNavigate}
          tabIndex={props.tabIndex}
          >
          {link.label}
          </a>
    ))}
    </>
  );
}

function closeOnLink(event: MouseEvent<HTMLElement>, close: () => void) {
  if (event.target instanceof Element && event.target.closest("a[href]")) close();
}

function SiteHeaderBrand(props: {
    brand: ReactNode;
    brandHref: false | string;
    labels?: SiteHeaderLabels;
    softRedirect?: boolean;
}) {
  const className = frontendElementClass(block, "brand");
  if (props.brandHref === false) {
    return <div className={className}>{props.brand}</div>;
  }
  return (
    <a
    aria-label={props.labels?.home}
    className={className}
    href={props.brandHref}
    {...frontendDataAttrs({ "soft-redirect": props.softRedirect ? "" : undefined })}
    >
    {props.brand}
    </a>
  );
}

function SiteHeaderBurger() {
  return (
    <span aria-hidden="true" className={frontendElementClass(block, "burger")}>
    <span />
    <span />
    <span />
    </span>
  );
}

function SiteHeaderToggle(props: SiteHeaderProps & { menuId: string; state: ReturnType<typeof useSiteHeaderMenu> }) {
  const { labels, menuId, state } = props;
  return (
    <button
    aria-controls={menuId}
    aria-expanded={state.open}
    aria-label={state.open ? labels?.closeMenu || "Close menu" : labels?.openMenu || "Open menu"}
    className={frontendElementClass(block, "toggle")}
    onClick={state.toggle}
    ref={state.toggleRef}
    type="button"
    >
    <SiteHeaderBurger />
    </button>
  );
}

function SiteHeaderMenu(props: SiteHeaderProps & { menuId: string; state: ReturnType<typeof useSiteHeaderMenu> }) {
  const { actions, labels, links = [], menuActions = actions, menuId, softRedirect, state } = props;
  return (
    <div
    aria-hidden={!state.open}
    className={frontendElementClass(block, "menu")}
    id={menuId}
    inert={!state.open}
    >
    <div className={frontendElementClass(block, "menu-body")}>
    <div className={frontendElementClass(block, "menu-content")}>
    {links.length ? (
        <nav aria-label={labels?.navigation} className={frontendElementClass(block, "menu-links")}>
        <SiteHeaderLinks element="menu-link" links={links} onNavigate={state.close} softRedirect={softRedirect} />
        </nav>
      ) : null}
    {menuActions ? (
        <div className={frontendElementClass(block, "menu-footer")} onClick={(event) => closeOnLink(event, state.close)}>
        {menuActions}
        </div>
      ) : null}
    </div>
    </div>
    </div>
  );
}

function SiteHeader(props: SiteHeaderProps) {
  const {
    actions, brand, brandHref = "/", className, labels, links = [], menuActions, softRedirect,
    surface = "solid", ...rest
  } = props;
  const state = useSiteHeaderMenu();
  const menuId = `${useId().replace(/:/gu, "")}_site_menu`;
  const hasMenu = links.length > 0 || Boolean(menuActions);
  return (
    <header
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-header": "", "site-header-open": state.open ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-menu": hasMenu ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-surface": surface })}
    ref={state.headerRef}
    >
    <div className={frontendElementClass(block, "bar")}>
    <SiteHeaderBrand
    brand={brand}
    brandHref={brandHref}
    labels={labels}
    softRedirect={softRedirect}
    />
    {links.length ? (
        <nav aria-label={labels?.navigation} className={frontendElementClass(block, "nav")}>
        <SiteHeaderLinks element="link" links={links} softRedirect={softRedirect} />
        </nav>
      ) : null}
    {actions ? <div className={frontendElementClass(block, "actions")}>{actions}</div> : null}
    {hasMenu ? <SiteHeaderToggle {...props} menuId={menuId} state={state} /> : null}
    </div>
    {hasMenu ? <SiteHeaderMenu {...props} menuId={menuId} state={state} /> : null}
    </header>
  );
}

export { SiteHeader };
export type { SiteHeaderLabels, SiteHeaderLink, SiteHeaderProps, SiteHeaderSurface };
