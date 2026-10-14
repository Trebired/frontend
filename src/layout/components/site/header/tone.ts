import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { frontendCssVar, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

type SiteHeaderTone = "dark" | "light";

type SiteHeaderToneSettings = { follows: boolean; probe: number };

const DARK_ATTR = frontendDataAttr("dark");
const BAND_SELECTOR = `main > *, ${frontendDataSelector("site-footer")}`;
const FOLLOW_VAR = frontendCssVar("shell-header-tone-follow");
const PROBE_VAR = frontendCssVar("shell-header-tone-probe");
const FOLLOW_BAND = "band";
const DEFAULT_PROBE = 0.5;

function readToneSettings(header: HTMLElement): SiteHeaderToneSettings {
  const styles = getComputedStyle(header);
  const probe = Number(styles.getPropertyValue(PROBE_VAR).trim());
  return {
    follows: styles.getPropertyValue(FOLLOW_VAR).trim() === FOLLOW_BAND,
    probe: Number.isFinite(probe) ? Math.min(Math.max(probe, 0), 1) : DEFAULT_PROBE,
  };
}

function bandBehind(line: number): Element | null {
  let found: Element | null = null;
  let nearest = -Infinity;
  for (const band of document.querySelectorAll(BAND_SELECTOR)) {
    const { top } = band.getBoundingClientRect();
    if (top > line || top <= nearest) continue;
    nearest = top;
    found = band;
  }
  return found;
}

function useSiteHeaderTone(headerRef: RefObject<HTMLElement|null>): SiteHeaderTone | undefined {
  const [tone, setTone] = useState<SiteHeaderTone>();
  const settings = useRef<SiteHeaderToneSettings|null>(null);

  const measure = useCallback(() => {
      const header = headerRef.current;
      if (!header || !settings.current?.follows) return;
      const box = header.getBoundingClientRect();
      const band = bandBehind(box.top + box.height * settings.current.probe);
      if (band) setTone(band.hasAttribute(DARK_ATTR) ? "dark" : "light");
    }, [headerRef]);

  useEffect(() => {
      const header = headerRef.current;
      if (!header) return undefined;
      settings.current = readToneSettings(header);
      if (!settings.current.follows) return undefined;
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
    }, [headerRef, measure]);

  useEffect(() => {
      measure();
  });

  return tone;
}

export { useSiteHeaderTone };
export type { SiteHeaderTone };
