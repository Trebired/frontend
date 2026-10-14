import { useCallback, useEffect, useRef, useState } from "react";
import { A11Y_CHANGE_EVENT, motionReduced } from "./../a11y/attributes.js";

type CarouselState = {
  activeIndex: number;
  onEnter: () => void;
  onLeave: () => void;
  showAt: (index: number) => void;
  showNext: () => void;
  showPrevious: () => void;
};

function prefersReducedMotion(): boolean {
  try {
    return motionReduced();
  } catch {
    return false;
  }
}

function useMotionPreference(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
      const sync = () => setReduced(prefersReducedMotion());
      sync();
      document.addEventListener(A11Y_CHANGE_EVENT, sync);
      return () => document.removeEventListener(A11Y_CHANGE_EVENT, sync);
    }, []);

  return reduced;
}

function useCarouselState(length: number, intervalMs: number): CarouselState {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMotionPreference();
  const timer = useRef<number|undefined>(undefined);

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
      if (paused || length < 2 || intervalMs <= 0 || reducedMotion) return undefined;
      timer.current = window.setInterval(showNext, intervalMs);
      return () => window.clearInterval(timer.current);
    }, [activeIndex, intervalMs, length, paused, reducedMotion, showNext]);

  return {
    activeIndex: Math.min(activeIndex, Math.max(length - 1, 0)),
    onEnter: () => setPaused(true),
    onLeave: () => setPaused(false),
    showAt,
    showNext,
    showPrevious,
  };
}

export { prefersReducedMotion, useCarouselState, useMotionPreference };
export type { CarouselState };
