import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { A11Y_MAIN_ID } from "./../../../a11y/attributes.js";
import {
  SiteHeaderAnchor,
  SiteHeaderMenuGroup,
  SiteHeaderNavTrigger,
  SiteHeaderSheetPanel,
  useSiteLinkState,
  type SheetProps,
} from "./header/groups.js";
import { isSiteLinkGroup, siteLinkKey, type SiteLink } from "./link.js";
import { resolveSiteLinks } from "./../../links.js";
import { useLocale } from "./../../../react/locale.js";

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
    softRedirect?: boolean;
}) {
  const shared = {
    ...useSiteLinkState(props.links),
    lang: props.lang,
    softRedirect: props.softRedirect,
  };
  const { sheetId } = props;
  return (
    <>
    {props.links.map((link, index) => {
          const key = siteLinkKey(link, index);
          if (!isSiteLinkGroup(link)) return <SiteHeaderAnchor {...shared} key={key} link={link} siblings={props.links} />;
          if (!sheetId) return <SiteHeaderMenuGroup {...shared} key={key} link={link} />;
          return <SiteHeaderNavTrigger {...shared} index={index} key={key} link={link} sheetId={sheetId} />;
    })}
    </>
  );
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

function SiteHeaderToggle(props: { labels?: SiteHeaderLabels; menuId: string }) {
  const { labels, menuId } = props;
  const openLabel = labels?.openMenu || "Open menu";
  return (
    <button
    aria-controls={menuId}
    aria-expanded={false}
    aria-label={openLabel}
    className={frontendElementClass(block, "toggle")}
    type="button"
    {...frontendDataAttrs({
          "site-header-label-close": labels?.closeMenu || "Close menu",
          "site-header-label-open": openLabel,
    })}
    >
    <SiteHeaderBurger />
    </button>
  );
}

function SiteHeaderMenu(props: SiteHeaderProps & { links: SiteHeaderLink[]; menuId: string }) {
  const { actions, labels, links, menuActions = actions, menuId, softRedirect } = props;
  return (
    <div
    aria-hidden={true}
    className={frontendElementClass(block, "menu")}
    id={menuId}
    inert
    >
    <div className={frontendElementClass(block, "menu-body")}>
    <div className={frontendElementClass(block, "menu-content")}>
    {links.length ? (
        <nav aria-label={labels?.navigation} className={frontendElementClass(block, "menu-links")}>
        <SiteHeaderLinks lang={props.lang} links={links} softRedirect={softRedirect} />
        </nav>
      ) : null}
    {menuActions ? (
        <>
        <span aria-hidden="true" className={frontendElementClass(block, "menu-divider")} />
        <div className={frontendElementClass(block, "menu-footer")}>{menuActions}</div>
        </>
      ) : null}
    </div>
    </div>
    </div>
  );
}

function SiteHeaderNav(props: SheetProps & { labels?: SiteHeaderLabels; links: SiteHeaderLink[]; softRedirect?: boolean }) {
  return (
    <nav aria-label={props.labels?.navigation} className={frontendElementClass(block, "nav")}>
    <SiteHeaderLinks links={props.links} sheetId={props.sheetId} softRedirect={props.softRedirect} />
    </nav>
  );
}

function SiteHeader(props: SiteHeaderProps) {
  const {
    actions, brand, brandHref = "/", className, labels, lang: givenLang, menuActions,
    softRedirect, ...rest
  } = props;
  const { locale } = useLocale();
  const lang = givenLang || locale;
  const links = resolveSiteLinks(lang)?.header || [];
  const baseId = useId().replace(/:/gu, "");
  const menuId = `${baseId}_site_menu`;
  const sheetId = `${baseId}_site_sheet`;
  const hasMenu = links.length > 0 || Boolean(menuActions);
  return (
    <header
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-header": "", "site-header-open": "false" })}
    {...frontendDataAttrs({ "site-header-menu": hasMenu ? "true" : "false" })}
    >
    <SiteHeaderSkipLink labels={labels} />
    <div className={frontendElementClass(block, "bar")}>
    <SiteHeaderBrand brand={brand} brandHref={brandHref} labels={labels} softRedirect={softRedirect} />
    {links.length ? <SiteHeaderNav labels={labels} links={links} sheetId={sheetId} softRedirect={softRedirect} /> : null}
    {actions ? <div className={frontendElementClass(block, "actions")}>{actions}</div> : null}
    {hasMenu ? <SiteHeaderToggle labels={labels} menuId={menuId} /> : null}
    </div>
    <SiteHeaderSheetPanel lang={lang} links={links} sheetId={sheetId} softRedirect={softRedirect} />
    {hasMenu ? <SiteHeaderMenu {...props} lang={lang} links={links} menuId={menuId} /> : null}
    </header>
  );
}

export { SiteHeader };
export type { SiteHeaderLabels, SiteHeaderLink, SiteHeaderProps };
