import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";
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

const block = "page-outline";
const ACTIVE_LINE = 0.3;

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
  const [active, setActive] = useState("");
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

function PageOutline(props: PageOutlineProps) {
  const { className, items, label } = props;
  const active = useActiveSection(items);
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={classNames(frontendClassName(block), className)}>
    <ol className={frontendElementClass(block, "list")}>
    {items.map((item) => (
          <li key={item.id}>
          <a
          aria-current={item.id === active ? "true" : undefined}
          className={frontendElementClass(block, "link")}
          href={`#${item.id}`}
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
  );
}

export { PageOutline };
export type { PageOutlineItem, PageOutlineProps };
