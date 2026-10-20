import type { HTMLAttributes, MouseEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useId } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { A11Y_MAIN_ID } from "./../../../a11y/attributes.js";
import { useSiteHeaderMenu } from "./header/state.js";
import { useSiteHeaderFit } from "./header/fit.js";
import { useSiteHeaderSheet } from "./header/sheet.js";
import {
  SiteHeaderAnchor,
  SiteHeaderMenuGroup,
  SiteHeaderNavTrigger,
  SiteHeaderSheetPanel,
  useSiteLinkState,
  type SheetProps,
} from "./header/groups.js";
import { isSiteLinkGroup, siteLinkKey, type SiteLink } from "./link.js";

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
  lang?: string;
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

function SiteHeaderLinks(props: Partial<SheetProps> & {
    lang?: string;
    links: SiteHeaderLink[];
    onNavigate?: () => void;
    softRedirect?: boolean;
    tabIndex?: number;
}) {
  const shared = {
    ...useSiteLinkState(props.links),
    lang: props.lang,
    onNavigate: props.onNavigate,
    softRedirect: props.softRedirect,
    tabIndex: props.tabIndex,
  };
  const { sheet, sheetId } = props;
  return (
    <>
    {props.links.map((link, index) => {
          const key = siteLinkKey(link, index);
          if (!isSiteLinkGroup(link)) return <SiteHeaderAnchor {...shared} key={key} link={link} />;
          if (!sheet || !sheetId) return <SiteHeaderMenuGroup {...shared} key={key} link={link} />;
          return <SiteHeaderNavTrigger {...shared} index={index} key={key} link={link} sheet={sheet} sheetId={sheetId} />;
    })}
    </>
  );
}

function closeSheetOverLink(event: PointerEvent<HTMLElement>, close: () => void) {
  if (event.target instanceof Element && event.target.closest("a[href]")) close();
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
        <SiteHeaderLinks lang={props.lang} links={links} onNavigate={state.close} softRedirect={softRedirect} />
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

function SiteHeaderNav(props: SheetProps & { labels?: SiteHeaderLabels; links: SiteHeaderLink[]; softRedirect?: boolean }) {
  const { sheet } = props;
  return (
    <nav
    aria-label={props.labels?.navigation}
    className={frontendElementClass(block, "nav")}
    onPointerOver={(event) => closeSheetOverLink(event, sheet.leave)}
    >
    <SiteHeaderLinks links={props.links} sheet={sheet} sheetId={props.sheetId} softRedirect={props.softRedirect} />
    </nav>
  );
}

function SiteHeader(props: SiteHeaderProps) {
  const {
    actions, brand, brandHref = "/", className, labels, lang, links = [], menuActions,
    softRedirect, ...rest
  } = props;
  const state = useSiteHeaderMenu();
  const baseId = useId().replace(/:/gu, "");
  const menuId = `${baseId}_site_menu`;
  const sheetId = `${baseId}_site_sheet`;
  const hasMenu = links.length > 0 || Boolean(menuActions);
  const compact = useSiteHeaderFit(state.headerRef, hasMenu);
  const sheet = useSiteHeaderSheet(state.headerRef);
  useEffect(() => {
      if (compact) sheet.close();
    }, [compact, sheet.close]);
  return (
    <header
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-header": "", "site-header-open": state.open ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-menu": hasMenu ? "true" : "false" })}
    {...frontendDataAttrs({ "site-header-compact": compact ? "true" : undefined })}
    onPointerEnter={sheet.stay}
    onPointerLeave={sheet.leave}
    ref={state.headerRef}
    >
    <SiteHeaderSkipLink labels={labels} />
    <div className={frontendElementClass(block, "bar")}>
    <SiteHeaderBrand brand={brand} brandHref={brandHref} labels={labels} softRedirect={softRedirect} />
    {links.length ? <SiteHeaderNav labels={labels} links={links} sheet={sheet} sheetId={sheetId} softRedirect={softRedirect} /> : null}
    {actions ? <div className={frontendElementClass(block, "actions")}>{actions}</div> : null}
    {hasMenu ? <SiteHeaderToggle {...props} menuId={menuId} state={state} /> : null}
    </div>
    <SiteHeaderSheetPanel lang={lang} links={links} sheet={sheet} sheetId={sheetId} softRedirect={softRedirect} />
    {hasMenu ? <SiteHeaderMenu {...props} menuId={menuId} state={state} /> : null}
    </header>
  );
}

export { SiteHeader };
export type { SiteHeaderLabels, SiteHeaderLink, SiteHeaderProps };
