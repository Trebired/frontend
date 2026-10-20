import type { MouseEvent, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import { stripLocalePrefix } from "./../../../language/routing/runtime.js";

type SiteLink = {
  active?: boolean;
  description?: ReactNode;
  href?: string;
  key?: string;
  label: ReactNode;
  links?: SiteLink[];
  node?: ReactNode;
  rel?: string;
  search?: boolean;
  softRedirect?: boolean;
  target?: string;
};

const linkBlock = "text-link";

function sitePath(value: unknown): string {
  const raw = String(value || "").trim();
  const withoutOrigin = raw.includes("://") ? raw.replace(/^[a-z]+:\/\/[^/]*/iu, "") : raw;
  return (withoutOrigin.split("#")[0].split("?")[0] || "/").replace(/\/+$/u, "") || "/";
}

function sitePathForms(value: unknown): string[] {
  const path = sitePath(value);
  const stripped = stripLocalePrefix(path).replace(/\/+$/u, "") || "/";
  return stripped === path ? [path] : [path, stripped];
}

function sitePathMatches(currentPath: string, target: string): boolean {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

function siteLinkFragment(link: SiteLink): string {
  const [, fragment = ""] = String(link.href || "").split("#");
  return fragment;
}

function siteLinkChildren(link: SiteLink): SiteLink[] {
  return Array.isArray(link.links) ? link.links : [];
}

function isSiteLinkGroup(link: SiteLink): boolean {
  return siteLinkChildren(link).length > 0;
}

function siteLinkKey(link: SiteLink, index: number): string {
  return link.key || String(link.href || "") || `group_${index}`;
}

function isForeignOrigin(href: unknown, currentUrl: string): boolean {
  const raw = String(href || "");
  if (!raw.includes("://")) return false;
  const [origin = ""] = raw.match(/^[a-z]+:\/\/[^/]*/iu) || [];
  const [currentOrigin = ""] = String(currentUrl || "").match(/^[a-z]+:\/\/[^/]*/iu) || [];
  if (!currentOrigin) return true;
  return origin.toLowerCase() !== currentOrigin.toLowerCase();
}

function siteLinkOnCurrentPage(link: SiteLink, currentPaths: string[]): boolean {
  const targets = sitePathForms(link.href);
  return currentPaths.some((current) => targets.some((target) => sitePathMatches(current, target)));
}

function isSiteLinkActive(
  link: SiteLink,
  currentPaths: string[],
  section: string,
  hasSection: boolean,
  currentUrl = "",
): boolean {
  if (link.active !== undefined) return link.active;
  if (isForeignOrigin(link.href, currentUrl)) return false;
  if (isSiteLinkGroup(link)) {
    return siteLinkChildren(link).some((child) => isSiteLinkActive(child, currentPaths, section, hasSection, currentUrl));
  }
  const fragment = siteLinkFragment(link);
  if (fragment) return Boolean(section) && fragment === section && siteLinkOnCurrentPage(link, currentPaths);
  if (hasSection && section) return false;
  const targets = sitePathForms(link.href);
  if (targets.includes("/")) return currentPaths.includes("/");
  return currentPaths.some((current) => targets.some((target) => sitePathMatches(current, target)));
}

type SiteLinkAnchorProps = {
  active?: boolean;
  className?: string;
  link: SiteLink;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
  plain?: boolean;
  softRedirect?: boolean;
  tabIndex?: number;
};

function SiteLinkAnchor(props: SiteLinkAnchorProps) {
  const { active = false, className, link, plain = false } = props;
  if (link.node !== undefined) return <>{link.node}</>;
  const base = plain ? "" : frontendClassName(linkBlock);
  const variant = className || "";
  return (
    <a
    aria-current={active ? "page" : undefined}
    className={classNames(
        base,
        base && active ? `${base}--active` : "",
        variant,
        variant && active ? `${variant}--active` : "",
    )}
    href={link.href}
    onClick={props.onNavigate}
    rel={link.target === "_blank" ? link.rel || "noopener noreferrer" : link.rel}
    tabIndex={props.tabIndex}
    target={link.target}
    {...frontendDataAttrs({ "soft-redirect": link.softRedirect ?? props.softRedirect ? "" : undefined })}
    >
    {link.label}
    </a>
  );
}

export {
  isSiteLinkActive,
  isSiteLinkGroup,
  linkBlock,
  SiteLinkAnchor,
  siteLinkChildren,
  siteLinkFragment,
  siteLinkKey,
  siteLinkOnCurrentPage,
  sitePathForms,
};
export type { SiteLink, SiteLinkAnchorProps };
