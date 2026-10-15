import { Disclosure, DisclosureButton } from "./../../../inputs/components/disclosure.js";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useEffect, useId, useSyncExternalStore } from "react";
import { PopoverOpenButton, PopoverPanel } from "./../../../popover/components/index.js";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { A11Y_MAIN_ID } from "./../../../a11y/attributes.js";
import { useSiteHeaderMenu } from "./header/state.js";
import { useSiteHeaderFit } from "./header/fit.js";
import { activeSection, observeSections, serverActiveSection, subscribeActiveSection } from "./section_spy.js";
import {
  isSiteLinkActive,
  isSiteLinkGroup,
  SiteLinkAnchor,
  siteLinkChildren,
  siteLinkFragment,
  siteLinkKey,
  siteLinkOnCurrentPage,
  sitePathForms,
  type SiteLink,
} from "./link.js";
import { useRenderCurrentUrl } from "./../../../render/current_url.js";

type SiteHeaderLink = SiteLink;

type SiteHeaderLabels = {
  closeMenu?: string;
  home?: string;
  navigation?: string;
  openMenu?: string;
  skipToContent?: string;
};

type SiteHeaderProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  actions?: ReactNode;
  brand: ReactNode;
  brandHref?: false | string;
  labels?: SiteHeaderLabels;
  links?: SiteHeaderLink[];
  menuActions?: ReactNode;
  softRedirect?: boolean;
};

const block = "site-header";

function SiteHeaderSkipLink({ labels }: { labels?: SiteHeaderLabels }) {
  return (
    <a
    className={frontendClassName("skip-link")}
    href={`#${A11Y_MAIN_ID}`}
    >
    {labels?.skipToContent || "Skip to content"}
    </a>
  );
}

type LinkRenderProps = {
  currentPaths: string[];
  currentUrl: string;
  hasSection: boolean;
  onNavigate?: () => void;
  section: string;
  softRedirect?: boolean;
  tabIndex?: number;
};

function SiteHeaderAnchor(
  props: LinkRenderProps & { className?: string; link: SiteHeaderLink; plain?: boolean },
) {
  const { className, currentPaths, hasSection, link, section } = props;
  return (
    <SiteLinkAnchor
    active={isSiteLinkActive(link, currentPaths, section, hasSection, props.currentUrl)}
    className={className || frontendElementClass(block, "link")}
    link={link}
    onNavigate={props.onNavigate}
    plain={props.plain}
    softRedirect={props.softRedirect}
    tabIndex={props.tabIndex}
    />
  );
}

function SiteHeaderNavGroup(props: LinkRenderProps & { link: SiteHeaderLink }) {
  const { currentPaths, hasSection, link, section } = props;
  const panelId = `${useId().replace(/:/gu, "")}_nav_group`;
  const active = isSiteLinkActive(link, currentPaths, section, hasSection, props.currentUrl);
  return (
    <>
    <PopoverOpenButton
    aria-current={active ? "true" : undefined}
    className={frontendElementClass(block, "nav-trigger")}
    controls={panelId}
    hover
    tabIndex={props.tabIndex}
    >
    <span className={frontendElementClass(block, "link-label")}>{link.label}</span>
    </PopoverOpenButton>
    <PopoverPanel id={panelId}>
    {siteLinkChildren(link).map((child, index) => (
          <SiteHeaderAnchor
          {...props}
          plain
          className={frontendClassName("popover-item")}
          key={siteLinkKey(child, index)}
          link={child}
          />
    ))}
    </PopoverPanel>
    </>
  );
}

function SiteHeaderChevron() {
  return (
    <span aria-hidden="true" className={frontendElementClass(block, "menu-group-chevron")} />
  );
}

function SiteHeaderMenuGroup(props: LinkRenderProps & { link: SiteHeaderLink }) {
  return (
    <Disclosure
    className={frontendElementClass(block, "menu-group")}
    panel={
      <div className={frontendElementClass(block, "menu-group-links")}>
      {siteLinkChildren(props.link).map((child, index) => (
            <SiteHeaderAnchor {...props} key={siteLinkKey(child, index)} link={child} />
      ))}
      </div>
    }
    trigger={
      <DisclosureButton className={frontendElementClass(block, "menu-group-label")}>
      <span>{props.link.label}</span>
      <SiteHeaderChevron />
      </DisclosureButton>
    }
    />
  );
}

function SiteHeaderLinks(props: {
    grouped?: boolean;
    links: SiteHeaderLink[];
    onNavigate?: () => void;
    softRedirect?: boolean;
    tabIndex?: number;
}) {
  const currentUrl = useRenderCurrentUrl();
  const currentPaths = sitePathForms(currentUrl);
  const fragments = props.links.flatMap((link) => (isSiteLinkGroup(link) ? siteLinkChildren(link) : [link]))
  .filter((link) => siteLinkFragment(link) && siteLinkOnCurrentPage(link, currentPaths))
  .map((link) => siteLinkFragment(link));
  const fragmentKey = fragments.join("|");
  useEffect(() => {
      observeSections(fragmentKey ? fragmentKey.split("|") : []);
    }, [fragmentKey]);
  const section = useSyncExternalStore(subscribeActiveSection, activeSection, serverActiveSection);
  const shared = {
    currentPaths,
    currentUrl,
    hasSection: fragments.length > 0,
    onNavigate: props.onNavigate,
    section,
    softRedirect: props.softRedirect,
    tabIndex: props.tabIndex,
  };
  return (
    <>
    {props.links.map((link, index) => {
          const key = siteLinkKey(link, index);
          if (!isSiteLinkGroup(link)) return <SiteHeaderAnchor {...shared} key={key} link={link} />;
          if (props.grouped) return <SiteHeaderMenuGroup {...shared} key={key} link={link} />;
          return <SiteHeaderNavGroup {...shared} key={key} link={link} />;
    })}
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
        <SiteHeaderLinks grouped links={links} onNavigate={state.close} softRedirect={softRedirect} />
        </nav>
      ) : null}
    {menuActions ? (
        <>
        <span aria-hidden="true" className={frontendElementClass(block, "menu-divider")} />
        <div className={frontendElementClass(block, "menu-footer")} onClick={(event) => closeOnLink(event, state.close)}>
        {menuActions}
        </div>
        </>
      ) : null}
    </div>
    </div>
    </div>
  );
}

function SiteHeader(props: SiteHeaderProps) {
  const {
    actions, brand, brandHref = "/", className, labels, links = [], menuActions,
    softRedirect, ...rest
  } = props;
  const state = useSiteHeaderMenu();
  const menuId = `${useId().replace(/:/gu, "")}_site_menu`;
  const hasMenu = links.length > 0 || Boolean(menuActions);
  const compact = useSiteHeaderFit(state.headerRef, hasMenu);
  return (
    <header
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-header": "", "site-header-open": state.open ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-menu": hasMenu ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-compact": compact ? "true" : undefined })}
    ref={state.headerRef}
    >
    <SiteHeaderSkipLink labels={labels} />
    <div className={frontendElementClass(block, "bar")}>
    <SiteHeaderBrand
    brand={brand}
    brandHref={brandHref}
    labels={labels}
    softRedirect={softRedirect}
    />
    {links.length ? (
        <nav aria-label={labels?.navigation} className={frontendElementClass(block, "nav")}>
        <SiteHeaderLinks links={links} softRedirect={softRedirect} />
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
export type { SiteHeaderLabels, SiteHeaderLink, SiteHeaderProps };
