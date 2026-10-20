import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { registerOverlayCloser } from "#wx6aeo50d9rb";
import { frontendDataSelector } from "#5vbaqj4pirp3";
import { SITE_HEADER_DESKTOP_QUERY } from "./state.js";

const CLOSE_DELAY = 180;
const HOVER_GRACE = 400;

type SiteHeaderSheet = {
  close: () => void;
  current: string;
  hover: (key: string) => void;
  leave: () => void;
  open: string;
  stay: () => void;
  toggle: (key: string, keyboard: boolean) => void;
};

function focusFirstLink(header: HTMLElement | null, key: string) {
  requestAnimationFrame(() => {
      const section = header?.querySelector(`${frontendDataSelector("site-header-section", key)}`);
      section?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
  });
}

function useSheetDismissal(headerRef: RefObject<HTMLElement|null>, open: string, close: () => void) {
  useEffect(() => registerOverlayCloser(close), [close]);
  useEffect(() => {
      const header = headerRef.current;
      if (!open || !header) return undefined;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        const inside = header.contains(document.activeElement);
        close();
        if (inside) header.querySelector<HTMLElement>(frontendDataSelector("site-header-trigger", open))?.focus({ preventScroll: true });
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.target instanceof Node && !header.contains(event.target)) close();
      };
      const onFocusOut = (event: FocusEvent) => {
        if (!(event.relatedTarget instanceof Node) || !header.contains(event.relatedTarget)) close();
      };
      const media = window.matchMedia?.(SITE_HEADER_DESKTOP_QUERY);
      const onMedia = () => {
        if (!media?.matches) close();
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("pointerdown", onPointerDown);
      header.addEventListener("focusout", onFocusOut);
      media?.addEventListener?.("change", onMedia);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("pointerdown", onPointerDown);
        header.removeEventListener("focusout", onFocusOut);
        media?.removeEventListener?.("change", onMedia);
      };
    }, [close, headerRef, open]);
}

function useSiteHeaderSheet(headerRef: RefObject<HTMLElement|null>): SiteHeaderSheet {
  const [open, setOpen] = useState("");
  const [current, setCurrent] = useState("");
  const timer = useRef(0);
  const hoveredAt = useRef(0);
  const stay = useCallback(() => {
      window.clearTimeout(timer.current);
      timer.current = 0;
    }, []);
  const close = useCallback(() => {
      stay();
      setOpen("");
    }, [stay]);
  const hover = useCallback((key: string) => {
      stay();
      hoveredAt.current = Date.now();
      setCurrent(key);
      setOpen(key);
    }, [stay]);
  const leave = useCallback(() => {
      stay();
      timer.current = window.setTimeout(() => setOpen(""), CLOSE_DELAY);
    }, [stay]);
  const toggle = useCallback((key: string, keyboard: boolean) => {
      stay();
      const closing = open === key && Date.now() - hoveredAt.current >= HOVER_GRACE;
      setCurrent(key);
      setOpen(closing ? "" : key);
      if (keyboard && !closing) focusFirstLink(headerRef.current, key);
    }, [headerRef, open, stay]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useSheetDismissal(headerRef, open, close);
  return { close, current, hover, leave, open, stay, toggle };
}

export { useSiteHeaderSheet };
export type { SiteHeaderSheet };
