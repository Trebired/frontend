import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useRenderCurrentUrl } from "./../../../render/current_url.js";
import { isSiteLinkActive, SiteLinkAnchor, siteLinkKey, sitePathForms, type SiteLink } from "./link.js";
import { Icon } from "#lbkpzw8nphru";
import { siteSocialService } from "./../../social.js";
import { resolveSiteLinks, type SiteLinksFooterGroup } from "./../../links.js";
import { useLocale } from "./../../../react/locale.js";
import { sourceLanguageMessage } from "./../../../language/messages.js";
import { SiteLinkCategory } from "./category.js";

type SiteFooterSocial = {
  href: string;
  icon?: string;
  label?: string;
  service?: string;
};

type SiteFooterBand = {
  brand?: ReactNode;
  social?: SiteFooterSocial[];
  tagline?: ReactNode;
};

type SiteFooterCredit = {
  href?: string;
  name?: string;
};

type SiteFooterProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  brand?: ReactNode;
  credit?: boolean | SiteFooterCredit;
  note?: ReactNode;
  site?: SiteFooterBand;
  social?: SiteFooterSocial[];
  softRedirect?: boolean;
  tagline?: ReactNode;
  tone?: "inverse" | "muted";
};

const block = "site-footer";

const TREBIRED: Required<SiteFooterCredit> = { href: "https://trebired.com", name: "Trebired" };

function socialEntry(entry: SiteFooterSocial) {
  const known = entry.service ? siteSocialService(entry.service) : null;
  return {
    href: entry.href,
    icon: entry.icon || known?.icon || "",
    label: entry.label || known?.label || entry.service || "",
  };
}

function SiteFooterSocialLinks({ social }: { social: SiteFooterSocial[] }) {
  const entries = social.map(socialEntry).filter((entry) => entry.href && entry.icon);
  if (entries.length === 0) return null;

  return (
    <div className={frontendElementClass(block, "social")}>
    {entries.map((entry) => (
          <a
          key={entry.href}
          aria-label={entry.label}
          className={frontendElementClass(block, "social-link")}
          href={entry.href}
          rel="noreferrer"
          target="_blank"
          >
          <Icon spec={entry.icon} />
          </a>
    ))}
    </div>
  );
}

function FooterLink({ link, siblings, softRedirect }: { link: SiteLink; siblings: SiteLink[]; softRedirect?: boolean }) {
  const currentUrl = useRenderCurrentUrl();
  return (
    <SiteLinkAnchor
    active={isSiteLinkActive(link, sitePathForms(currentUrl), "", false, currentUrl, siblings)}
    link={link}
    softRedirect={softRedirect}
    />
  );
}

function FooterLinks({ className, links, softRedirect }: { className: string; links: SiteLink[]; softRedirect?: boolean }) {
  if (!links.length) return null;
  return (
    <nav className={frontendElementClass(block, className)}>
    {links.map((link, index) => (
          <FooterLink key={siteLinkKey(link, index)} link={link} siblings={links} softRedirect={softRedirect} />
    ))}
    </nav>
  );
}

function FooterGroup({ group, softRedirect }: { group: SiteLinksFooterGroup; softRedirect?: boolean }) {
  return (
    <SiteLinkCategory heading={group.heading} nav>
    {group.links.map((link, index) => (
          <FooterLink key={siteLinkKey(link, index)} link={link} siblings={group.links} softRedirect={softRedirect} />
    ))}
    </SiteLinkCategory>
  );
}

function SiteFooterBrand({ brand, social, tagline }: SiteFooterBand) {
  if (!brand && !tagline && !social?.length) return null;
  return (
    <div className={frontendElementClass(block, "brand")}>
    {brand}
    {tagline ? <p className={frontendElementClass(block, "tagline")}>{tagline}</p> : null}
    <SiteFooterSocialLinks social={social || []} />
    </div>
  );
}

function SiteFooterBand({ band, links, softRedirect }: { band: SiteFooterBand; links: SiteLink[]; softRedirect?: boolean }) {
  return (
    <div className={frontendElementClass(block, "site")}>
    <SiteFooterBrand {...band} />
    <FooterLinks className="site-links" links={links} softRedirect={softRedirect} />
    </div>
  );
}

function SiteFooterCreditLine({ credit, lang }: { credit?: boolean | SiteFooterCredit; lang: string }) {
  if (!credit) return null;
  const { href, name } = { ...TREBIRED, ...(credit === true ? {} : credit) };
  return (
    <span className={frontendElementClass(block, "credit")}>
    {sourceLanguageMessage("footerCredit", lang)}{" "}
    <SiteLinkAnchor link={{ external: true, href, label: name, rel: "noopener" }} />
    </span>
  );
}

function SiteFooter(props: SiteFooterProps) {
  const { brand, className, credit, note, site, social = [], softRedirect, tagline, tone, ...rest } = props;
  const { locale } = useLocale();
  const links = resolveSiteLinks(locale)?.footer;
  const columns = links?.columns || [];
  const noteLinks = links?.note || [];

  return (
    <footer
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-footer": "" })}
    {...frontendDataAttrs({ "site-footer-tone": tone })}
    {...frontendDataAttrs({ dark: tone === "inverse" ? "" : undefined })}
    >
    {site ? <SiteFooterBand band={site} links={links?.site || []} softRedirect={softRedirect} /> : null}
    <div className={frontendElementClass(block, "inner")}>
    <SiteFooterBrand brand={brand} social={social} tagline={tagline} />
    {columns.length > 0 ? (
        <div className={frontendElementClass(block, "columns")}>
        {columns.map((column) => (
              <div className={frontendElementClass(block, "column")} key={column.key}>
              {column.groups.map((group) => <FooterGroup key={group.key} group={group} softRedirect={softRedirect} />)}
              </div>
        ))}
        </div>
      ) : null}
    </div>
    {note || noteLinks.length || credit ? (
        <div className={frontendElementClass(block, "note")}>
        {note}
        <FooterLinks className="note-links" links={noteLinks} softRedirect={softRedirect} />
        <SiteFooterCreditLine credit={credit} lang={locale} />
        </div>
      ) : null}
    </footer>
  );
}

export { SiteFooter };
export type { SiteFooterBand, SiteFooterCredit, SiteFooterProps, SiteFooterSocial };
