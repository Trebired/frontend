import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { frontendElementClass } from "#5vbaqj4pirp3";

const NAV_SELECTOR = `.${frontendElementClass("site-header", "nav")}`;
const FIT_SLACK = 8;

function useSiteHeaderFit(headerRef: RefObject<HTMLElement|null>, hasMenu: boolean): boolean {
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const fitsFrom = useRef(0);

  const measure = useCallback(() => {
      const header = headerRef.current;
      const nav = hasMenu ? header?.querySelector(NAV_SELECTOR) : null;
      if (!header || !nav) return;
      const width = header.clientWidth;
      if (compactRef.current) {
        if (!fitsFrom.current || width < fitsFrom.current) return;
        compactRef.current = false;
        setCompact(false);
        return;
      }
      const deficit = nav.scrollWidth - nav.clientWidth;
      if (deficit <= 1) return;
      fitsFrom.current = width + deficit + FIT_SLACK;
      compactRef.current = true;
      setCompact(true);
    }, [hasMenu, headerRef]);

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
      window.addEventListener("resize", schedule, { passive: true });
      document.fonts?.ready?.then(schedule).catch (() => {});
      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("resize", schedule);
      };
    }, [measure]);

  useEffect(() => {
      measure();
  });

  return compact;
}

export { useSiteHeaderFit };
