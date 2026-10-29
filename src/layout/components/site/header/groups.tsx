import { useEffect, useId, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Disclosure, DisclosureButton } from "./../../../../inputs/components/disclosure.js";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useRenderCurrentUrl } from "./../../../../render/current_url.js";
import { activeSection, observeSections, serverActiveSection, subscribeActiveSection } from "./../section_spy.js";
import {
  isSiteLinkActive,
  isSiteLinkGroup,
  SiteLinkAnchor,
  siteLinkChildren,
  SiteLinkLabel,
  siteLinkFragment,
  siteLinkKey,
  siteLinkOnCurrentPage,
  sitePathForms,
  type SiteLink,
} from "./../link.js";
import type { SiteHeaderSheet } from "./sheet.js";
import { SiteHeaderSearch } from "./search.js";
import { SiteLinkCategory } from "./../category.js";

type LinkRenderProps = {
  currentPaths: string[];
  currentUrl: string;
  hasSection: boolean;
  lang?: string;
  onNavigate?: () => void;
  section: string;
  softRedirect?: boolean;
  tabIndex?: number;
};

type GroupProps = LinkRenderProps & { link: SiteLink; siblings?: SiteLink[] };

type SheetProps = { sheet: SiteHeaderSheet; sheetId: string };

const block = "site-header";

function siteLinkLeaves(links: SiteLink[]): SiteLink[] {
  return links.flatMap((link) => (isSiteLinkGroup(link) ? siteLinkLeaves(siteLinkChildren(link)) : [link]));
}

function useSiteLinkState(links: SiteLink[]) {
  const currentUrl = useRenderCurrentUrl();
  const currentPaths = sitePathForms(currentUrl);
  const fragments = siteLinkLeaves(links)
  .filter((link) => siteLinkFragment(link) && siteLinkOnCurrentPage(link, currentPaths))
  .map((link) => siteLinkFragment(link));
  const fragmentKey = fragments.join("|");
  useEffect(() => {
      observeSections(fragmentKey ? fragmentKey.split("|") : []);
    }, [fragmentKey]);
  const section = useSyncExternalStore(subscribeActiveSection, activeSection, serverActiveSection);
  return { currentPaths, currentUrl, hasSection: fragments.length > 0, section };
}

type AnchorProps = LinkRenderProps & { children?: ReactNode; className?: string; link: SiteLink; plain?: boolean; siblings?: SiteLink[] };

function SiteHeaderAnchor(props: AnchorProps) {
  const { className, currentPaths, hasSection, link, section } = props;
  return (
    <SiteLinkAnchor
    active={isSiteLinkActive(link, currentPaths, section, hasSection, props.currentUrl, props.siblings)}
    className={className}
    link={link}
    onNavigate={props.onNavigate}
    plain={props.plain}
    softRedirect={props.softRedirect}
    tabIndex={props.tabIndex}
    >
    {props.children}
    </SiteLinkAnchor>
  );
}

function SiteHeaderNavTrigger(props: GroupProps & SheetProps & { index: number }) {
  const { link, sheet } = props;
  const key = String(props.index);
  return (
    <button
    aria-controls={`${props.sheetId}_${key}`}
    aria-expanded={sheet.open === key}
    className={frontendElementClass(block, "nav-trigger")}
    onClick={(event) => sheet.toggle(key, event.detail === 0)}
    onPointerEnter={(event) => {
        if (event.pointerType === "mouse") sheet.hover(key);
    }}
    tabIndex={props.tabIndex}
    type="button"
    {...frontendDataAttrs({ "site-header-trigger": key })}
    >
    <span className={frontendClassName("text-link")}>{link.label}</span>
    <span aria-hidden="true" className={frontendElementClass(block, "nav-chevron")} />
    </button>
  );
}

function SheetEntry(props: GroupProps) {
  const { link } = props;
  const description = link.description === undefined ? null : (
    <span className={frontendElementClass(block, "sheet-description")}>{link.description}</span>
  );
  return (
    <SiteHeaderAnchor {...props} className={frontendElementClass(block, "sheet-entry")} link={link} plain>
    <span className={frontendClassName("text-link")}><SiteLinkLabel link={link} /></span>
    {description}
    </SiteHeaderAnchor>
  );
}

function SheetColumn(props: GroupProps) {
  const headingId = `${useId().replace(/:/gu, "")}_sheet_heading`;
  return (
    <div aria-labelledby={headingId} className={frontendElementClass(block, "sheet-column")} role="group">
    <h2 className={frontendElementClass(block, "sheet-heading")} id={headingId}>{props.link.label}</h2>
    <div className={`${frontendElementClass(block, "sheet-links")} ${frontendClassName("scroll-min")}`}>
    {siteLinkChildren(props.link).map((child, index, siblings) => (
          <SheetEntry {...props} key={siteLinkKey(child, index)} link={child} siblings={siblings} />
    ))}
    </div>
    </div>
  );
}

function SheetGrid(props: GroupProps) {
  const children = siteLinkChildren(props.link);
  const columns = children.some(isSiteLinkGroup);
  return (
    <div
    className={frontendElementClass(block, "sheet-grid")}
    {...frontendDataAttrs({ "site-header-layout": columns ? "columns" : "list" })}
    >
    {children.map((child, index) => {
          const key = siteLinkKey(child, index);
          if (isSiteLinkGroup(child)) return <SheetColumn {...props} key={key} link={child} />;
          return <SheetEntry {...props} key={key} link={child} siblings={children} />;
    })}
    </div>
  );
}

function SheetSection(props: GroupProps & { hidden: boolean; id: string; sectionKey: string }) {
  const grid = <SheetGrid {...props} />;
  return (
    <div
    className={frontendElementClass(block, "sheet-section")}
    hidden={props.hidden}
    id={props.id}
    {...frontendDataAttrs({ "site-header-section": props.sectionKey })}
    >
    {props.link.search ? (
        <SiteHeaderSearch lang={props.lang} onNavigate={props.onNavigate} softRedirect={props.softRedirect}>{grid}</SiteHeaderSearch>
      ) : grid}
    </div>
  );
}

function SiteHeaderSheetPanel(props: SheetProps & { lang?: string; links: SiteLink[]; softRedirect?: boolean }) {
  const { links, sheet, sheetId } = props;
  const state = useSiteLinkState(links);
  const groups = links.map((link, index) => ({ index, link })).filter(({ link }) => isSiteLinkGroup(link));
  if (!groups.length) return null;
  const open = Boolean(sheet.open);
  return (
    <div
    aria-hidden={!open}
    className={frontendElementClass(block, "sheet")}
    inert={!open}
    onPointerEnter={sheet.stay}
    {...frontendDataAttrs({ "site-header-sheet": open ? "open" : "closed" })}
    >
    <div className={`${frontendElementClass(block, "sheet-body")} ${frontendClassName("scroll-min")}`}>
    <div className={frontendElementClass(block, "sheet-content")}>
    {groups.map(({ index, link }) => (
          <SheetSection
          {...state}
          hidden={sheet.current !== String(index)}
          id={`${sheetId}_${index}`}
          key={siteLinkKey(link, index)}
          lang={props.lang}
          link={link}
          onNavigate={sheet.close}
          sectionKey={String(index)}
          softRedirect={props.softRedirect}
          />
    ))}
    </div>
    </div>
    </div>
  );
}

function SiteHeaderChevron() {
  return <span aria-hidden="true" className={frontendElementClass(block, "menu-group-chevron")} />;
}

function MenuSection(props: GroupProps) {
  return (
    <SiteLinkCategory heading={props.link.label}>
    {siteLinkChildren(props.link).map((child, index, siblings) => (
          <SiteHeaderAnchor {...props} key={siteLinkKey(child, index)} link={child} siblings={siblings} />
    ))}
    </SiteLinkCategory>
  );
}

function MenuGroupLinks(props: GroupProps) {
  const links = (
    <div className={frontendElementClass(block, "menu-group-links")}>
    {siteLinkChildren(props.link).map((child, index, siblings) => {
          const key = siteLinkKey(child, index);
          if (isSiteLinkGroup(child)) return <MenuSection {...props} key={key} link={child} />;
          return <SiteHeaderAnchor {...props} key={key} link={child} siblings={siblings} />;
    })}
    </div>
  );
  if (!props.link.search) return links;
  return <SiteHeaderSearch lang={props.lang} onNavigate={props.onNavigate} softRedirect={props.softRedirect}>{links}</SiteHeaderSearch>;
}

function SiteHeaderMenuGroup(props: GroupProps) {
  return (
    <Disclosure
    className={frontendElementClass(block, "menu-group")}
    panel={
      <MenuGroupLinks {...props} />
    }
    trigger={
      <DisclosureButton className={frontendElementClass(block, "menu-group-label")}>
      <span className={frontendClassName("text-link")}>{props.link.label}</span>
      <SiteHeaderChevron />
      </DisclosureButton>
    }
    />
  );
}

export { SiteHeaderAnchor, SiteHeaderMenuGroup, SiteHeaderNavTrigger, SiteHeaderSheetPanel, useSiteLinkState };
export type { LinkRenderProps, SheetProps };
