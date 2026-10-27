import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendCssVar, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { PopoverOpenButton, PopoverPanel } from "#5j678cbskl2w";
import { bindPopoverTrigger, hidePopover } from "#knbi1qla9fbx";
import { motionReduced } from "./../../a11y/attributes.js";
import {
  outlineBlock as block,
  OutlineList,
  PageOutline,
  useClientLayoutEffect,
  usePageOutline,
  type PageOutlineItem,
  type PageOutlineLayoutProps,
  type PageOutlineProps,
} from "./outline.js";

const layoutBlock = "page-outline-layout";

function useDockTrigger(dockRef: RefObject<HTMLDivElement|null>) {
  useEffect(() => {
      const frame = requestAnimationFrame(() => bindPopoverTrigger(dockRef.current?.querySelector("button") || null));
      return () => cancelAnimationFrame(frame);
    }, [dockRef]);
}

function useAfterPaint(): RefObject<boolean> {
  const painted = useRef(false);
  useEffect(() => {
      const frame = requestAnimationFrame(() => {
          painted.current = true;
      });
      return () => cancelAnimationFrame(frame);
    }, []);
  return painted;
}

function useDockMotion(items: PageOutlineItem[], active: string, painted: RefObject<boolean>): "down" | "up" | undefined {
  const previous = useRef(active);
  const moved = useRef<"down" | "up" | undefined>(undefined);
  if (previous.current !== active && !painted.current) previous.current = active;
  if (previous.current !== active) {
    const from = items.findIndex((item) => item.id === previous.current);
    moved.current = items.findIndex((item) => item.id === active) < from ? "up" : "down";
    previous.current = active;
  }
  return moved.current;
}

function useDockWidth(dockRef: RefObject<HTMLDivElement|null>, active: string, painted: RefObject<boolean>) {
  const width = useRef(0);
  useClientLayoutEffect(() => {
      const button = dockRef.current?.querySelector("button");
      if (!button) return;
      const from = width.current;
      button.style.width = "";
      const to = button.getBoundingClientRect().width;
      width.current = to;
      if (!painted.current || !from || Math.abs(from - to) < 1 || motionReduced()) return;
      button.style.width = `${from}px`;
      void button.offsetWidth;
      button.style.width = `${to}px`;
      const clear = () => {
        button.style.width = "";
      };
      button.addEventListener("transitionend", clear, { once: true });
      return () => button.removeEventListener("transitionend", clear);
    }, [active, dockRef, painted]);
}

const AWAY_LINE = 0.85;

function useDockInView(dockRef: RefObject<HTMLDivElement|null>, panelId: string) {
  useEffect(() => {
      const dock = dockRef.current;
      const layout = dock?.parentElement;
      if (!dock || !layout) return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        const box = layout.getBoundingClientRect();
        const line = window.innerHeight * AWAY_LINE;
        const away = box.bottom < line || box.top > line;
        if (away === (dock.getAttribute(frontendDataAttr("outline-away")) === "true")) return;
        if (away) {
          dock.setAttribute(frontendDataAttr("outline-away"), "true");
          hidePopover(document.getElementById(panelId));
        } else dock.removeAttribute(frontendDataAttr("outline-away"));
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      };
    }, [dockRef, panelId]);
}

function dockBootSource(): string {
  const list = `.${frontendElementClass(block, "list")}`;
  const rail = JSON.stringify(`${list} a[aria-current="true"]`);
  const label = JSON.stringify(`.${frontendElementClass(block, "dock-current")}`);
  const top = JSON.stringify(frontendCssVar("outline-marker-top"));
  const height = JSON.stringify(frontendCssVar("outline-marker-height"));
  return [
    "(function(){try{var s=document.currentScript,d=s&&s.previousElementSibling,p=d&&d.parentElement;if(!p)return;",
    `var c=p.querySelector(${rail});if(!c)return;var h=c.getAttribute('href'),t=d.querySelector(${label});`,
    "if(t)t.textContent=c.textContent;",
    `var l=d.querySelector(${JSON.stringify(list)}),a=d.querySelectorAll('a[href^="#"]'),m=null;for(var i=0;i<a.length;i++){`,
    "if(a[i].getAttribute('href')===h){a[i].setAttribute('aria-current','true');m=a[i]}else a[i].removeAttribute('aria-current')}",
    `if(l&&m){l.style.setProperty(${top},m.offsetTop+'px');l.style.setProperty(${height},m.offsetHeight+'px')}`,
    "}catch(e){}})();",
  ].join("");
}

function PageOutlineDock(props: PageOutlineProps) {
  const { items, label } = props;
  const dockRef = useRef<HTMLDivElement>(null);
  const id = `${useId().replace(/:/gu, "")}_outline_dock`;
  const own = usePageOutline(props.state ? [] : items);
  const state = props.state || own;
  const { active } = state;
  const listRef = useRef<HTMLOListElement>(null);
  const painted = useAfterPaint();
  const motion = useDockMotion(items, active, painted);
  useDockTrigger(dockRef);
  useDockWidth(dockRef, active, painted);
  useDockInView(dockRef, id);
  const current = items.find((item) => item.id === active) || items[0];
  if (!current) return null;

  return (
    <div className={frontendElementClass(block, "dock")} ref={dockRef}>
    <PopoverOpenButton aria-label={label} className={frontendElementClass(block, "dock-toggle")} controls={id} indicator={false}>
    <span aria-hidden="true" className={frontendElementClass(block, "dock-icon")} />
    <span className={frontendElementClass(block, "dock-window")}>
    <span
    className={frontendElementClass(block, "dock-current")}
    key={current.id}
    suppressHydrationWarning
    {...frontendDataAttrs({ "outline-motion": motion })}
    >
    {current.label}
    </span>
    </span>
    </PopoverOpenButton>
    <PopoverPanel aria-label={label} className={frontendElementClass(block, "dock-panel")} id={id} role="navigation">
    <div className={frontendClassName(block)}>
    <OutlineList closes items={items} listRef={listRef} state={state} />
    </div>
    </PopoverPanel>
    </div>
  );
}

function PageOutlineLayout(props: PageOutlineLayoutProps) {
  const { aside, children, className, frame, items, label } = props;
  const state = usePageOutline(items);
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
        <PageOutline items={items} label={label} state={state} />
        </aside>
        </div>
      ) : null}
    <div className={frontendElementClass(layoutBlock, "content")}>{children}</div>
    {items.length > 1 ? (
        <>
        <PageOutlineDock items={items} label={label} state={state} />
        <script dangerouslySetInnerHTML={{ __html: dockBootSource() }} />
        </>
      ) : null}
    </div>
  );
}

export { PageOutlineDock, PageOutlineLayout };
