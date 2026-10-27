import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendCssVar, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { motionReduced } from "./../../a11y/attributes.js";

type PageOutlineItem = {
  id: string;
  label: ReactNode;
};

type PageOutlineProps = {
  className?: string;
  items: PageOutlineItem[];
  label?: string;
  state?: PageOutlineState;
};

type PageOutlineState = {
  active: string;
  listRef: RefObject<HTMLOListElement|null>;
  select: (id: string) => void;
};

type PageOutlineLayoutProps = PageOutlineProps & {
  aside?: ReactNode;
  children: ReactNode;
  frame?: boolean;
};

type Hold = { id: string; settled: boolean; timer: number };

const block = "page-outline";
const ACTIVE_LINE = 0.3;
const SETTLE_DELAY = 160;
const OUTLINE_STORAGE_PREFIX = "tbf.outline:";
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown"] as const;
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function sectionTops(items: PageOutlineItem[]): [string, number][] {
  const tops: [string, number][] = [];
  for (const item of items) {
    const element = document.getElementById(item.id);
    if (element) tops.push([item.id, element.getBoundingClientRect().top]);
  }
  return tops;
}

function atPageEnd(): boolean {
  const { scrollHeight } = document.documentElement;
  return window.scrollY > 0 && window.scrollY + window.innerHeight >= scrollHeight - 2;
}

function activeId(items: PageOutlineItem[]): string {
  const tops = sectionTops(items);
  const last = tops[tops.length - 1];
  if (!last) return items[0]?.id || "";
  if (atPageEnd()) return last[0];
  const line = Math.max(window.innerHeight * ACTIVE_LINE, 120);
  let current = tops[0]?.[0] || "";
  for (const [id, top] of tops) if (top <= line) current = id;
  return current;
}

function bootedId(list: HTMLOListElement | null, items: PageOutlineItem[]): string {
  const id = list?.querySelector("a[aria-current=\"true\"]")?.getAttribute("href")?.slice(1) || "";
  return items.some((item) => item.id === id) ? id : "";
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

function settleLater(hold: Hold) {
  window.clearTimeout(hold.timer);
  hold.timer = window.setTimeout(() => {
      hold.settled = true;
    }, SETTLE_DELAY);
}

function watchScroll(measure: () => void, hold: { current: Hold | null }): () => void {
  let frame = 0;
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
    });
  };
  const release = () => {
    if (hold.current) window.clearTimeout(hold.current.timer);
    hold.current = null;
    schedule();
  };
  const onScroll = () => {
    const held = hold.current;
    if (!held) schedule();
    else if (held.settled) release();
    else settleLater(held);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  USER_SCROLL_EVENTS.forEach((name) => window.addEventListener(name, release, { passive: true }));
  return () => {
    if (frame) cancelAnimationFrame(frame);
    if (hold.current) window.clearTimeout(hold.current.timer);
    window.removeEventListener("load", schedule);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", schedule);
    USER_SCROLL_EVENTS.forEach((name) => window.removeEventListener(name, release));
  };
}

function useActiveSection(items: PageOutlineItem[], listRef: RefObject<HTMLOListElement|null>): [string, (id: string) => void] {
  const [active, setActive] = useState(() => items[0]?.id || "");
  const key = items.map((item) => item.id).join("|");
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const hold = useRef<Hold | null>(null);

  useClientLayoutEffect(() => {
      if (!itemsRef.current.length) return;
      const booted = bootedId(listRef.current, itemsRef.current);
      if (booted) setActive(booted);
      return watchScroll(() => setActive(hold.current ? hold.current.id : activeId(itemsRef.current)), hold);
    }, [key, listRef]);

  const select = useCallback((id: string) => {
      if (hold.current) window.clearTimeout(hold.current.timer);
      const next: Hold = { id, settled: false, timer: 0 };
      settleLater(next);
      hold.current = next;
      setActive(id);
    }, []);

  return [active, select];
}

function useMarker(listRef: RefObject<HTMLOListElement|null>, active: string) {
  useClientLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const place = () => {
        const current = list.querySelector<HTMLElement>("[aria-current=\"true\"]");
        if (!current) return;
        list.style.setProperty(frontendCssVar("outline-marker-top"), `${current.offsetTop}px`);
        list.style.setProperty(frontendCssVar("outline-marker-height"), `${current.offsetHeight}px`);
        list.setAttribute(frontendDataAttr("outline-ready"), "true");
      };
      place();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(place);
      observer.observe(list);
      return () => observer.disconnect();
    }, [active, listRef]);
}

function outlineBootWanted(): string[] {
  return [
    `var P=${JSON.stringify(OUTLINE_STORAGE_PREFIX)},w='',N='';`,
    "try{N=(performance.getEntriesByType('navigation')[0]||{}).type||''}catch(e){}",
    "if(N==='reload'||N==='back_forward'){try{w=sessionStorage.getItem(P+location.pathname+location.search)||''}catch(e){}}",
    "if(!w){try{w=decodeURIComponent(location.hash.slice(1))}catch(e){}}",
  ];
}

function outlineBootSave(): string[] {
  const current = JSON.stringify(`.${frontendElementClass(block, "link")}[aria-current="true"]`);
  return [
    "addEventListener('pagehide',function(){try{",
    `var k=document.querySelector(${current});`,
    "if(k)sessionStorage.setItem(P+location.pathname+location.search,k.getAttribute('href').slice(1))}catch(e){}});",
  ];
}

function outlineBootSource(): string {
  const markerTop = JSON.stringify(frontendCssVar("outline-marker-top"));
  const markerHeight = JSON.stringify(frontendCssVar("outline-marker-height"));
  const ready = JSON.stringify(frontendDataAttr("outline-ready"));
  return [
    "(function(){try{var s=document.currentScript,n=s&&s.previousElementSibling;if(!n)return;",
    "var l=n.querySelector('ol'),a=n.querySelectorAll('a[href^=\"#\"]'),c=a[0]||null;",
    ...outlineBootWanted(),
    "for(var i=0;i<a.length;i++){if(a[i].getAttribute('href').slice(1)===w)c=a[i]}",
    "for(var j=0;j<a.length;j++){if(a[j]===c)a[j].setAttribute('aria-current','true');else a[j].removeAttribute('aria-current')}",
    `if(l&&c){l.style.setProperty(${markerTop},c.offsetTop+'px');`,
    `l.style.setProperty(${markerHeight},c.offsetHeight+'px');l.setAttribute(${ready},'true')}`,
    ...outlineBootSave(),
    "}catch(e){}})();",
  ].join("");
}

function usePageOutline(items: PageOutlineItem[]): PageOutlineState {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, select] = useActiveSection(items, listRef);
  return { active, listRef, select };
}

type OutlineListProps = {
  closes?: boolean;
  items: PageOutlineItem[];
  listRef: RefObject<HTMLOListElement|null>;
  state: PageOutlineState;
};

function OutlineList({ closes = false, items, listRef, state }: OutlineListProps) {
  useMarker(listRef, state.active);
  return (
    <ol className={frontendElementClass(block, "list")} ref={listRef} suppressHydrationWarning>
    {items.map((item) => (
          <li key={item.id}>
          <a
          aria-current={item.id === state.active ? "true" : undefined}
          className={frontendElementClass(block, "link")}
          href={`#${item.id}`}
          suppressHydrationWarning
          {...frontendDataAttrs({ "popover-close": closes ? "" : undefined })}
          onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              state.select(item.id);
              scrollToSection(item.id);
          }}
          >
          {item.label}
          </a>
          </li>
    ))}
    </ol>
  );
}

function PageOutline(props: PageOutlineProps) {
  const { className, items, label } = props;
  const own = usePageOutline(props.state ? [] : items);
  const state = props.state || own;
  if (items.length === 0) return null;

  return (
    <>
    <nav aria-label={label} className={classNames(frontendClassName(block), className)}>
    <OutlineList items={items} listRef={state.listRef} state={state} />
    </nav>
    <script dangerouslySetInnerHTML={{ __html: outlineBootSource() }} />
    </>
  );
}

export { block as outlineBlock, OutlineList, PageOutline, useClientLayoutEffect, usePageOutline };
export type { PageOutlineItem, PageOutlineLayoutProps, PageOutlineProps, PageOutlineState };
