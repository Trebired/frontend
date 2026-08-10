import { classNames } from "#ndsvdqv80epr";
import {
  MobileNav,
  MobileNavCloseButton,
  MobileNavToggleButton,
} from "#beon2qdcbsoe";
import {
  MobileBottomBar,
  MobileBottomBarItem,
} from "#8egdy32zm0ku";
import { ShellSupportLinks } from "#4sx52pc9h7zp";
import { productShellLabel, readProductShellState } from "./state.js";
import type {
  ProductShellBottomBarProps,
  ProductShellMobileNavProps,
} from "./types.js";

function mobileHeaderContent(props: ProductShellMobileNavProps) {
  if (props.headerContent !== undefined) return props.headerContent;
  return (
    <ShellSupportLinks
    baseHref={props.supportHref}
    docsLabel={productShellLabel(props.labels, "docs")}
    feedbackLabel={productShellLabel(props.labels, "feedback")}
    supportLabel={productShellLabel(props.labels, "support")}
    />
  );
}

function mobileSection(label: string, content: unknown, hidden: boolean) {
  if (hidden || !content) return null;
  return (
    <section className="tbf-shell-mobile-nav__section">
    <div className="tbf-shell-mobile-nav__section-label">{label}</div>
    {content as any}
    </section>
  );
}

function ProductShellMobileNav(props: ProductShellMobileNavProps) {
  const state = readProductShellState(props.shell);
  if (!state.chrome.showMobileNav) return null;
  return (
    <MobileNav
    className={classNames("tbf-shell-mobile-nav-shell", props.className)}
    id={props.id || "mobile_nav_shell"}
    panelLabel={productShellLabel(props.labels, "mobileNavigation")}
    >
    <div className={classNames("tbf-shell-mobile-nav", props.contentClassName)}>
    <div className="tbf-shell-mobile-nav__head">
    <span className={classNames("tbf-shell-mobile-nav__title", props.titleClassName)}>
    {productShellLabel(props.labels, "menu")}
    </span>
    <MobileNavCloseButton
    aria-label={productShellLabel(props.labels, "closeNavigationMenu")}
    className="tbf-shell-mobile-nav__close"
    >
    {props.closeIcon ?? productShellLabel(props.labels, "closeNavigationMenu")}
    </MobileNavCloseButton>
    </div>
    {mobileSection(productShellLabel(props.labels, "navigation"), props.sidebarContent, !state.chrome.showSidebarLinks)}
    {mobileSection(productShellLabel(props.labels, "more"), mobileHeaderContent(props), !state.chrome.showHeaderLinks)}
    {mobileSection(productShellLabel(props.labels, "account"), props.accountContent, !state.chrome.showHeaderUserActions)}
    </div>
    </MobileNav>
  );
}

function bottomBarItem(
  href: string,
  label: string,
  icon: unknown,
  className: string | undefined,
) {
  return (
    <MobileBottomBarItem className={className} href={href} icon={icon as any}>
    {label}
    </MobileBottomBarItem>
  );
}

function ProductShellBottomBar(props: ProductShellBottomBarProps) {
  const {
    appIcon,
    appsHref = "/apps",
    itemClassName,
    labels,
    menuIcon,
    menuToggleClassName,
    notifications,
    profileHref = "/me",
    profileIcon,
    ...rest
  } = props;
  return (
    <MobileBottomBar
    {...rest}
    aria-label={props["aria-label"] || productShellLabel(labels, "mobilePrimaryNavigation")}
    >
    {bottomBarItem(appsHref, productShellLabel(labels, "apps"), appIcon, itemClassName)}
    {notifications}
    {bottomBarItem(profileHref, productShellLabel(labels, "profile"), profileIcon, itemClassName)}
    <MobileNavToggleButton
    aria-label={productShellLabel(labels, "menu")}
    className={classNames(itemClassName, menuToggleClassName)}
    controls="mobile_nav_shell"
    >
    {menuIcon}
    <span className="tbf-mobile-bottom-bar__label">
    {productShellLabel(labels, "menu")}
    </span>
    </MobileNavToggleButton>
    </MobileBottomBar>
  );
}

export { ProductShellBottomBar, ProductShellMobileNav };
