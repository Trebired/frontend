import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useId } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useSiteHeaderMenu } from "./header_state.js";

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
  brandHref?: string;
  closeIcon?: ReactNode;
  labels?: SiteHeaderLabels;
  links?: SiteHeaderLink[];
  menuActions?: ReactNode;
  menuIcon?: ReactNode;
  softRedirect?: boolean;
  surface?: SiteHeaderSurface;
};

const block = "site-header";

function linkAttrs(link: SiteHeaderLink, softRedirect: boolean | undefined) {
  return {
    "aria-current": link.active ? "page" as const : undefined,
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
  return (
    <>
    {props.links.map((link) => (
          <a
          {...linkAttrs(link, props.softRedirect)}
          className={frontendElementClass(block, props.element)}
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
  const { closeIcon, labels, menuIcon, menuId, state } = props;
  const custom = state.open ? closeIcon : menuIcon;
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
    {custom ?? <SiteHeaderBurger />}
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
    actions, brand, brandHref = "/", className, closeIcon, labels, links = [], menuActions, menuIcon, softRedirect,
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
    <a
    aria-label={labels?.home}
    className={frontendElementClass(block, "brand")}
    href={brandHref}
    {...frontendDataAttrs({ "soft-redirect": softRedirect ? "" : undefined })}
    >
    {brand}
    </a>
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
