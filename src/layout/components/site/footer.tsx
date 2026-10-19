import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { useRenderCurrentUrl } from "./../../../render/current_url.js";
import { isSiteLinkActive, SiteLinkAnchor, siteLinkKey, sitePathForms, type SiteLink } from "./link.js";
import { Icon } from "#lbkpzw8nphru";
import { siteSocialService } from "./../../social.js";

type SiteFooterLink = SiteLink;

type SiteFooterGroup = {
  heading: ReactNode;
  key?: string;
  links?: SiteFooterLink[];
};

type SiteFooterColumn = {
  content?: ReactNode;
  groups?: SiteFooterGroup[];
  heading?: ReactNode;
  key?: string;
  links?: SiteFooterLink[];
};

type SiteFooterSocial = {
  href: string;
  icon?: string;
  label?: string;
  service?: string;
};

type SiteFooterBand = {
  brand?: ReactNode;
  links?: SiteFooterLink[];
  social?: SiteFooterSocial[];
  tagline?: ReactNode;
};

type SiteFooterProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  brand?: ReactNode;
  columns?: SiteFooterColumn[];
  note?: ReactNode;
  site?: SiteFooterBand;
  social?: SiteFooterSocial[];
  softRedirect?: boolean;
  tagline?: ReactNode;
  tone?: "inverse" | "muted";
};

const block = "site-footer";

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

function FooterLink({ link, softRedirect }: { link: SiteFooterLink; softRedirect?: boolean }) {
  const currentPaths = sitePathForms(useRenderCurrentUrl());
  return (
    <SiteLinkAnchor
    active={isSiteLinkActive(link, currentPaths, "", false, useRenderCurrentUrl())}
    link={link}
    softRedirect={softRedirect}
    />
  );
}

function FooterGroup({ group, softRedirect }: { group: SiteFooterGroup; softRedirect?: boolean }) {
  return (
    <div className={frontendElementClass(block, "group")}>
    <h5>{group.heading}</h5>
    {group.links ? (
        <nav className={frontendElementClass(block, "links")}>
        {group.links.map((link, index) => (
              <FooterLink key={siteLinkKey(link, index)} link={link} softRedirect={softRedirect} />
        ))}
        </nav>
      ) : null}
    </div>
  );
}

function columnGroups(column: SiteFooterColumn): SiteFooterGroup[] {
  if (column.groups?.length) return column.groups;
  if (!column.heading) return [];
  return [{ heading: column.heading, links: column.links }];
}

function FooterColumn({ column, softRedirect }: { column: SiteFooterColumn; softRedirect?: boolean }) {
  return (
    <div className={frontendElementClass(block, "column")}>
    {columnGroups(column).map((group, index) => (
          <FooterGroup key={group.key || index} group={group} softRedirect={softRedirect} />
    ))}
    {column.content}
    </div>
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

function SiteFooterBand({ band, softRedirect }: { band: SiteFooterBand; softRedirect?: boolean }) {
  return (
    <div className={frontendElementClass(block, "site")}>
    <SiteFooterBrand {...band} />
    {band.links?.length ? (
        <nav className={frontendElementClass(block, "site-links")}>
        {band.links.map((link, index) => (
              <FooterLink key={siteLinkKey(link, index)} link={link} softRedirect={softRedirect} />
        ))}
        </nav>
      ) : null}
    </div>
  );
}

function SiteFooter(props: SiteFooterProps) {
  const { brand, className, columns = [], note, site, social = [], softRedirect, tagline, tone, ...rest } = props;

  return (
    <footer
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-footer": "" })}
    {...frontendDataAttrs({ "site-footer-tone": tone })}
    {...frontendDataAttrs({ dark: tone === "inverse" ? "" : undefined })}
    >
    {site ? <SiteFooterBand band={site} softRedirect={softRedirect} /> : null}
    <div className={frontendElementClass(block, "inner")}>
    <SiteFooterBrand brand={brand} social={social} tagline={tagline} />
    {columns.length > 0 ? (
        <div className={frontendElementClass(block, "columns")}>
        {columns.map((column, index) => (
              <FooterColumn key={column.key || index} column={column} softRedirect={softRedirect} />
        ))}
        </div>
      ) : null}
    </div>
    {note ? <div className={frontendElementClass(block, "note")}>{note}</div> : null}
    </footer>
  );
}

export { SiteFooter };
export type { SiteFooterBand, SiteFooterColumn, SiteFooterGroup, SiteFooterLink, SiteFooterProps, SiteFooterSocial };
