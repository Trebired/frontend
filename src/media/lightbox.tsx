import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Icon } from "#lbkpzw8nphru";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { captureFocus, trapTabKey } from "./focus-trap.js";
import { useResolvedLang } from "./lang.js";
import { lockBodyScroll } from "./scroll-lock.js";

const ICON_CHEVRON_LEFT = "remixicon:arrow-left-s-line";
const ICON_CHEVRON_RIGHT = "remixicon:arrow-right-s-line";
const ICON_CLOSE = "remixicon:close-line";

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

function Lightbox(props: LightboxProps) {
  const lang = useResolvedLang(props.lang);
  const panel = useLightboxShell(props.close, props.showNext, props.showPrevious);
  const label = (key: string, vars?: Record<string, unknown>) => sourceLanguageMessage(key, lang, vars);
  const state = props.visible ? " is-visible" : "";

  const node = (
    <div
    aria-labelledby={props.titleId}
    aria-modal="true"
    className={`tbf-lightbox${state}`}
    onClick={props.close}
    ref={panel}
    role="dialog"
    tabIndex={-1}
    >
    <button aria-label={label("mediaClose")} className="tbf-lightbox-close" onClick={props.close} type="button">
    <Icon spec={ICON_CLOSE} />
    </button>

    {props.hasPrevious && (
        <button
        aria-label={label("mediaPrevious")}
        className="tbf-lightbox-nav tbf-lightbox-nav-prev"
        onClick={(event) => {
            stop(event);
            props.showPrevious();
        }}
        type="button"
        >
        <Icon spec={ICON_CHEVRON_LEFT} />
        </button>
    )}

    {props.hasNext && (
        <button
        aria-label={label("mediaNext")}
        className="tbf-lightbox-nav tbf-lightbox-nav-next"
        onClick={(event) => {
            stop(event);
            props.showNext();
        }}
        type="button"
        >
        <Icon spec={ICON_CHEVRON_RIGHT} />
        </button>
    )}

    <div className="tbf-lightbox-viewer" onClick={stop}>
    <h2 className="sr-only" id={props.titleId}>{props.alt}</h2>
    <img alt={props.alt} className="tbf-lightbox-img" src={props.src} />
    <p className="tbf-lightbox-caption">{props.alt}</p>
    </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

export { Lightbox };
export type { LightboxProps };
