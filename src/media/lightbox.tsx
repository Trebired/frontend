import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Icon } from "#lbkpzw8nphru";
import { frontendClassName } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { captureFocus, trapTabKey } from "./focus-trap.js";
import { ICON_MEDIA_CHEVRON_LEFT, ICON_MEDIA_CHEVRON_RIGHT, ICON_MEDIA_CLOSE } from "./icons.js";
import { useResolvedLang } from "./lang.js";
import { lockBodyScroll } from "./scroll-lock.js";

type LightboxProps = {
  alt: string;
  close: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  lang?: string;
  showNext: () => void;
  showPrevious: () => void;
  src: string;
  titleId: string;
  visible: boolean;
};

type LightboxNavProps = {
  direction: "next" | "prev";
  label: string;
  onClick: () => void;
};

function stop(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function useLightboxShell(close: () => void, showNext: () => void, showPrevious: () => void) {
  const panel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
      const node = panel.current;
      if (!node) return undefined;

      const releaseScroll = lockBodyScroll();
      const restoreFocus = captureFocus(node);

      function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") close();
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
        if (event.key === "Tab" && panel.current) trapTabKey(panel.current, event);
      }

      window.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        releaseScroll();
        restoreFocus();
      };
    }, [close, showNext, showPrevious]);

  return panel;
}

function LightboxNav(props: LightboxNavProps) {
  const icon = props.direction === "prev" ? ICON_MEDIA_CHEVRON_LEFT : ICON_MEDIA_CHEVRON_RIGHT;

  return (
    <button
    aria-label={props.label}
    className={`${frontendClassName("lightbox-nav")} ${frontendClassName(`lightbox-nav-${props.direction}`)}`}
    onClick={(event) => {
        stop(event);
        props.onClick();
    }}
    type="button"
    >
    <Icon spec={icon} />
    </button>
  );
}

function Lightbox(props: LightboxProps) {
  const lang = useResolvedLang(props.lang);
  const panel = useLightboxShell(props.close, props.showNext, props.showPrevious);
  const label = (key: string) => sourceLanguageMessage(key, lang);
  const state = props.visible ? " is-visible" : "";

  const node = (
    <div
    aria-labelledby={props.titleId}
    aria-modal="true"
    className={`${frontendClassName("lightbox")}${state}`}
    onClick={props.close}
    ref={panel}
    role="dialog"
    tabIndex={-1}
    >
    <button aria-label={label("mediaClose")} className={frontendClassName("lightbox-close")} onClick={props.close} type="button">
    <Icon spec={ICON_MEDIA_CLOSE} />
    </button>

    {props.hasPrevious && <LightboxNav direction="prev" label={label("mediaPrevious")} onClick={props.showPrevious} />}
    {props.hasNext && <LightboxNav direction="next" label={label("mediaNext")} onClick={props.showNext} />}

    <div className={`${frontendClassName("lightbox-viewer")}${state}`} onClick={stop}>
    <h2 className="sr-only" id={props.titleId}>{props.alt}</h2>
    <img alt={props.alt} className={frontendClassName("lightbox-img")} src={props.src} />
    <p className={frontendClassName("lightbox-caption")}>{props.alt}</p>
    </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

export { Lightbox };
export type { LightboxProps };
