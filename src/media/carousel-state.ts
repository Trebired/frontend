import { useCallback, useEffect, useRef, useState } from "react";

type CarouselState = {
  activeIndex: number;
  onEnter: () => void;
  onLeave: () => void;
  showAt: (index: number) => void;
  showNext: () => void;
  showPrevious: () => void;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function useCarouselState(length: number, intervalMs: number): CarouselState {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (length ? (current + 1) % length : 0));
  }, [length]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (length ? (current - 1 + length) % length : 0));
  }, [length]);

  const showAt = useCallback((index: number) => {
    setActiveIndex(() => Math.min(Math.max(index, 0), Math.max(length - 1, 0)));
  }, [length]);

  useEffect(() => {
      if (paused || length < 2 || intervalMs <= 0 || prefersReducedMotion()) return undefined;
      timer.current = window.setInterval(showNext, intervalMs);
      return () => window.clearInterval(timer.current);
    }, [activeIndex, intervalMs, length, paused, showNext]);

  return {
    activeIndex: Math.min(activeIndex, Math.max(length - 1, 0)),
    onEnter: () => setPaused(true),
    onLeave: () => setPaused(false),
    showAt,
    showNext,
    showPrevious,
  };
}

export { prefersReducedMotion, useCarouselState };
export type { CarouselState };
