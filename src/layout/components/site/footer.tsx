import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type SiteFooterLink = {
  href: string;
  key?: string;
  label: ReactNode;
  rel?: string;
  softRedirect?: boolean;
  target?: string;
};

type SiteFooterColumn = {
  heading: ReactNode;
  key?: string;
  links?: SiteFooterLink[];
  content?: ReactNode;
};

type SiteFooterProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  brand?: ReactNode;
  columns?: SiteFooterColumn[];
  note?: ReactNode;
  softRedirect?: boolean;
  tagline?: ReactNode;
  tone?: "inverse" | "muted";
};

const block = "site-footer";

function FooterLink({ link, softRedirect }: { link: SiteFooterLink; softRedirect?: boolean }) {
  return (
    <a
    className={frontendElementClass(block, "link")}
    href={link.href}
    rel={link.target === "_blank" ? link.rel || "noopener noreferrer" : link.rel}
    target={link.target}
    {...frontendDataAttrs({ "soft-redirect": link.softRedirect ?? softRedirect ? "" : undefined })}
    >
    {link.label}
    </a>
  );
}

function FooterColumn({ column, softRedirect }: { column: SiteFooterColumn; softRedirect?: boolean }) {
  return (
    <div className={frontendElementClass(block, "column")}>
    <h3 className={frontendElementClass(block, "heading")}>{column.heading}</h3>
    {column.links ? (
        <nav className={frontendElementClass(block, "links")}>
        {column.links.map((link) => (
              <FooterLink key={link.key || link.href} link={link} softRedirect={softRedirect} />
        ))}
        </nav>
      ) : null}
    {column.content}
    </div>
  );
}

function SiteFooter(props: SiteFooterProps) {
  const { brand, className, columns = [], note, softRedirect, tagline, tone, ...rest } = props;

  return (
    <footer
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "site-footer": "" })}
    {...frontendDataAttrs({ "site-footer-tone": tone })}
    >
    <div className={frontendElementClass(block, "inner")}>
    {brand || tagline ? (
        <div className={frontendElementClass(block, "brand")}>
        {brand}
        {tagline ? <p className={frontendElementClass(block, "tagline")}>{tagline}</p> : null}
        </div>
      ) : null}
    {columns.length > 0 ? (
        <div className={frontendElementClass(block, "columns")}>
        {columns.map((column, index) => (
              <FooterColumn
              key={column.key || index}
              column={column}
              softRedirect={softRedirect}
              />
        ))}
        </div>
      ) : null}
    </div>
    {note ? <div className={frontendElementClass(block, "note")}>{note}</div> : null}
    </footer>
  );
}

export { SiteFooter };
export type { SiteFooterColumn, SiteFooterLink, SiteFooterProps };
