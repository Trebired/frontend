import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendCssVar, frontendDataAttr, frontendElementClass } from "#5vbaqj4pirp3";
import { motionReduced } from "./../../a11y/attributes.js";

type PageOutlineItem = {
  id: string;
  label: ReactNode;
};

type PageOutlineProps = {
  className?: string;
  items: PageOutlineItem[];
  label?: string;
};

type PageOutlineLayoutProps = PageOutlineProps & {
  aside?: ReactNode;
  children: ReactNode;
  frame?: boolean;
};

const block = "page-outline";
const layoutBlock = "page-outline-layout";
const ACTIVE_LINE = 0.3;
const OUTLINE_STORAGE_PREFIX = "tbf.outline:";

function activeId(items: PageOutlineItem[]): string {
  let current = "";
  let nearest = -Infinity;
  const line = Math.max(window.innerHeight * ACTIVE_LINE, 120);
  for (const item of items) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    const { top } = element.getBoundingClientRect();
    if (top > line || top <= nearest) continue;
    nearest = top;
    current = item.id;
  }
  return current || items[0]?.id || "";
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

function useActiveSection(items: PageOutlineItem[]): string {
  const [active, setActive] = useState(() => items[0]?.id || "");
  const key = items.map((item) => item.id).join("|");
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const measure = useCallback(() => {
      setActive(activeId(itemsRef.current));
    }, []);

  useEffect(() => {
      let frame = 0;
      const run = () => {
        frame = 0;
        measure();
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(run);
      };
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      };
    }, [key, measure]);

  return active;
}

function useMarker(active: string): RefObject<HTMLOListElement|null> {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const current = list.querySelector<HTMLElement>("[aria-current=\"true\"]");
      list.style.setProperty(frontendCssVar("outline-marker-top"), `${current ? current.offsetTop : 0}px`);
      list.style.setProperty(frontendCssVar("outline-marker-height"), `${current ? current.offsetHeight : 0}px`);
      if (current) list.setAttribute(frontendDataAttr("outline-ready"), "true");
    }, [active]);

  return listRef;
}

function outlineBootWanted(): string[] {
  return [
    `var K=${JSON.stringify(OUTLINE_STORAGE_PREFIX)}+location.pathname+location.search,w='',N='';`,
    "try{N=(performance.getEntriesByType('navigation')[0]||{}).type||''}catch(e){}",
    "if(N==='reload'||N==='back_forward'){try{w=sessionStorage.getItem(K)||''}catch(e){}}",
    "if(!w){try{w=decodeURIComponent(location.hash.slice(1))}catch(e){}}",
  ];
}

function outlineBootSource(): string {
  const markerTop = JSON.stringify(frontendCssVar("outline-marker-top"));
  const markerHeight = JSON.stringify(frontendCssVar("outline-marker-height"));
  const ready = JSON.stringify(frontendDataAttr("outline-ready"));
  return [
    "(function(){try{var s=document.currentScript,n=s&&s.previousElementSibling;if(!n)return;",
    "var l=n.querySelector('ol'),a=n.querySelectorAll('a[href^=\"#\"]'),c=null;",
    ...outlineBootWanted(),
    "for(var i=0;i<a.length;i++){var id=a[i].getAttribute('href').slice(1);",
    "if(w?id===w:i===0){c=a[i];a[i].setAttribute('aria-current','true')}else a[i].removeAttribute('aria-current')}",
    `if(l&&c){l.style.setProperty(${markerTop},c.offsetTop+'px');`,
    `l.style.setProperty(${markerHeight},c.offsetHeight+'px');l.setAttribute(${ready},'true')}`,
    "addEventListener('pagehide',function(){try{var k=n.querySelector('a[aria-current=\"true\"]');",
    "if(k)sessionStorage.setItem(K,k.getAttribute('href').slice(1))}catch(e){}});",
    "}catch(e){}})();",
  ].join("");
}

function PageOutline(props: PageOutlineProps) {
  const { className, items, label } = props;
  const active = useActiveSection(items);
  const listRef = useMarker(active);
  if (items.length === 0) return null;

  return (
    <>
    <nav aria-label={label} className={classNames(frontendClassName(block), className)}>
    <ol
    className={frontendElementClass(block, "list")}
    ref={listRef}
    suppressHydrationWarning
    >
    {items.map((item) => (
          <li key={item.id}>
          <a
          aria-current={item.id === active ? "true" : undefined}
          className={frontendElementClass(block, "link")}
          href={`#${item.id}`}
          suppressHydrationWarning
          onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              scrollToSection(item.id);
          }}
          >
          {item.label}
          </a>
          </li>
    ))}
    </ol>
    </nav>
    <script dangerouslySetInnerHTML={{ __html: outlineBootSource() }} />
    </>
  );
}

function PageOutlineLayout(props: PageOutlineLayoutProps) {
  const { aside, children, className, frame, items, label } = props;
  if (items.length === 0 && !frame && !aside) return <>{children}</>;

  return (
    <div
    className={classNames(
        frontendClassName(layoutBlock),
        frame ? frontendClassName(`${layoutBlock}--frame`) : "",
        className,
    )}
    >
    {items.length > 0 || aside ? (
        <div className={frontendElementClass(layoutBlock, "track")}>
        <aside className={frontendElementClass(layoutBlock, "rail")}>
        {aside ? <div className={frontendElementClass(layoutBlock, "aside")}>{aside}</div> : null}
        <PageOutline items={items} label={label} />
        </aside>
        </div>
      ) : null}
    <div className={frontendElementClass(layoutBlock, "content")}>{children}</div>
    </div>
  );
}

export { PageOutline, PageOutlineLayout };
export type { PageOutlineItem, PageOutlineLayoutProps, PageOutlineProps };
