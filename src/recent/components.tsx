import { normalizeLocale } from "#2d8f076g07hg";
import { frontendClassNames, frontendDataAttrs } from "#5vbaqj4pirp3";
import { useCurrentUrl } from "#pwuc6i9ku53k";
import { LiveRegion } from "#i6fiia6z4x10";
import { time_counter } from "#g6zyfm1o41em";
import { normalizeRecentPages, type RecentPage } from "./model.js";

type RecentPagesLive = {
  channel: string;
  event: string;
  room: string;
};

type RecentPagesProps = {
  emptyText?: string;
  lang?: string;
  live?: RecentPagesLive;
  max?: number;
  pages: unknown;
};

const EMPTY_TEXT: Record<string, string> = {
  cs: "Zatím nic navštíveno.",
  en: "Nothing visited yet.",
};

function RecentPageRow(props: { page: RecentPage }) {
  const age = time_counter({ alwaysRender: true, live: true, start: props.page.visitedAt });
  return (
    <a href={props.page.href} {...frontendDataAttrs({ container: "card-row", "soft-redirect": "" })}>
    <div className={frontendClassNames("inline-row", "gap-xs", "card-body")}>
    <div className={frontendClassNames("column", "gap-xs")}>
    <span className={frontendClassNames("text-break")}>{props.page.title}</span>
    <div className={frontendClassNames("inline-row", "gap-xs2", "text-sm", "text-muted")}>
    <span className={frontendClassNames("text-muted", "no-stretch")}>{age}</span>
    <span className={frontendClassNames("text-muted", "no-stretch")}>•</span>
    <span className={frontendClassNames("text-muted", "truncate-1")} title={props.page.href}>{props.page.href}</span>
    </div>
    </div>
    </div>
    </a>
  );
}

function RecentPages(props: RecentPagesProps) {
  const current = useCurrentUrl();
  const here = `${current.pathname}${current.search}`;
  const pages = normalizeRecentPages(props.pages).filter((page) => page.href !== here).slice(0, Math.max(1, props.max || 5));
  const emptyText = props.emptyText || EMPTY_TEXT[normalizeLocale(props.lang)] || EMPTY_TEXT.en;
  const rows = pages.length
  ? pages.map((page) => <RecentPageRow key={page.href} page={page} />)
  : <p className={frontendClassNames("text-muted")}>{emptyText}</p>;
  const attrs = { className: frontendClassNames("column", "gap-xs"), ...frontendDataAttrs({ "recent-pages": "" }) };
  if (!props.live) return <div {...attrs}>{rows}</div>;
  return (
    <LiveRegion {...attrs} as="div" channel={props.live.channel} event={props.live.event} region="recent-pages" room={props.live.room}>
    {rows}
    </LiveRegion>
  );
}

export { RecentPages };
export type { RecentPagesLive, RecentPagesProps };
