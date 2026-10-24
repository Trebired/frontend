import type { ReactNode } from "react";
import { frontendMarkerName } from "#5vbaqj4pirp3";
import { TextLink } from "./link.js";

type ProseTextProps = {
  softRedirect?: boolean;
  text: string;
};

type ProseLink = {
  href: string;
  label: string;
  length: number;
  reload: boolean;
  start: number;
  tab: boolean;
};

const LINK_MARKER = frontendMarkerName("link");
const BRACKET_LINK = /\[([^\]]+)\]\((\/[^)]*|https?:\/\/[^)\s]+)\)/gu;
const MARKED_LINK = new RegExp(
  `<!--\\s*${LINK_MARKER}\\s+([^>]*?)-->([\\s\\S]*?)<!--\\s*/${LINK_MARKER}\\s*-->`,
  "gu",
);
const FLAGS = new Set(["reload", "tab"]);

function markedLink(match: RegExpMatchArray): ProseLink | null {
  const [href, ...flags] = String(match[1] || "").trim().split(/\s+/u);
  const label = String(match[2] || "").trim();
  if (!href || !label || flags.some((flag) => !FLAGS.has(flag))) return null;
  return {
    href,
    label,
    length: match[0].length,
    reload: flags.includes("reload"),
    start: match.index ?? 0,
    tab: flags.includes("tab"),
  };
}

function bracketLink(match: RegExpMatchArray): ProseLink {
  const href = match[2] as string;
  return {
    href,
    label: match[1] as string,
    length: match[0].length,
    reload: false,
    start: match.index ?? 0,
    tab: !href.startsWith("/"),
  };
}

function proseLinks(text: string): ProseLink[] {
  const found: ProseLink[] = [];
  for (const match of text.matchAll(MARKED_LINK)) {
    const link = markedLink(match);
    if (link) found.push(link);
  }
  for (const match of text.matchAll(BRACKET_LINK)) {
    const link = bracketLink(match);
    const inside = found.some((item) => link.start >= item.start && link.start < item.start + item.length);
    if (!inside) found.push(link);
  }
  return found.sort((left, right) => left.start - right.start);
}

function ProseText({ softRedirect, text }: ProseTextProps) {
  const links = proseLinks(text);
  if (links.length === 0) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const link of links) {
    if (link.start > cursor) parts.push(text.slice(cursor, link.start));
    parts.push(
      <TextLink
      key={link.start}
      external={link.tab}
      href={link.href}
      softRedirect={softRedirect === true && !link.reload && !link.tab}
      >
      {link.label}
      </TextLink>,
    );
    cursor = link.start + link.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export { ProseText };
export type { ProseTextProps };
