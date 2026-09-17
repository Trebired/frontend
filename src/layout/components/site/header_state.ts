import { useCallback, useEffect, useRef, useState } from "react";
import { registerOverlayCloser } from "#wx6aeo50d9rb";
import { frontendDataSelector } from "#5vbaqj4pirp3";

const SITE_HEADER_DESKTOP_QUERY = "(min-width: 768px)";
const SITE_HEADER_OUTSIDE_IGNORE = [
  frontendDataSelector("popover"),
  frontendDataSelector("layout-portal-root"),
  frontendDataSelector("modal"),
].join(",");

function isOutsideTarget(header: HTMLElement | null, target: EventTarget | null) {
  if (!header || !(target instanceof Element)) return false;
  if (header.contains(target)) return false;
  return !target.closest(SITE_HEADER_OUTSIDE_IGNORE);
}

function useSiteHeaderMenu() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement|null>(null);
  const toggleRef = useRef<HTMLButtonElement|null>(null);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => registerOverlayCloser(close), [close]);

  useEffect(() => {
      if (!open) return undefined;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      };
      const onPointerDown = (event: PointerEvent) => {
        if (isOutsideTarget(headerRef.current, event.target)) setOpen(false);
      };
      const media = window.matchMedia?.(SITE_HEADER_DESKTOP_QUERY);
      const onMedia = () => {
        if (media?.matches) setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("pointerdown", onPointerDown);
      media?.addEventListener?.("change", onMedia);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("pointerdown", onPointerDown);
        media?.removeEventListener?.("change", onMedia);
      };
    }, [open]);

  return { close, headerRef, open, toggle, toggleRef };
}

export { SITE_HEADER_DESKTOP_QUERY, useSiteHeaderMenu };
