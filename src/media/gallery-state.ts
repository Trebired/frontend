import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_ANIMATION_MS = 320;

type GalleryState = {
  activeIndex: number;
  close: () => void;
  expand: (index: number) => void;
  open: boolean;
  showNext: () => void;
  showPrevious: () => void;
  visible: boolean;
};

function useGalleryState(length: number, initialIndex: number): GalleryState {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const closeTimer = useRef<number | undefined>(undefined);

  const activeIndex = Math.min(Math.max(index, 0), Math.max(length - 1, 0));

  const close = useCallback(() => {
    setVisible(false);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_ANIMATION_MS);
  }, []);

  const expand = useCallback((next: number) => {
    window.clearTimeout(closeTimer.current);
    setIndex(next);
    setOpen(true);
    window.requestAnimationFrame(() => setVisible(true));
  }, []);

  const showPrevious = useCallback(() => setIndex((current) => Math.max(current - 1, 0)), []);
  const showNext = useCallback(() => setIndex((current) => Math.min(current + 1, length - 1)), [length]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return { activeIndex, close, expand, open, showNext, showPrevious, visible };
}

export { CLOSE_ANIMATION_MS, useGalleryState };
export type { GalleryState };
