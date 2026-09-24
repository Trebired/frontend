import { useEffect, useRef, useState } from "react";

import { frontendClassName } from "#5vbaqj4pirp3";
import { fullscreenSupported, toggleFullscreen } from "#e1wjbzbsyghi";

type EmbedFrameLabels = {
  error?: string;
  fullscreen?: string;
  loading?: string;
  open?: string;
};

type EmbedFrameProps = {
  allowFullScreen?: boolean;
  aspectRatio?: string;
  className?: string;
  labels?: EmbedFrameLabels;
  onState?: (state: EmbedFrameState) => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  sandbox?: string;
  src: string;
  timeoutMs?: number;
  title: string;
};

type EmbedFrameState = "error" | "loading" | "ready";

const DEFAULT_TIMEOUT_MS = 10000;

const DEFAULT_LABELS: Required<Omit<EmbedFrameLabels, "open">> = {
  error: "This content could not be loaded. It may be unreachable, or it may refuse to be embedded.",
  fullscreen: "Toggle fullscreen",
  loading: "Loading…",
};

function whenDocumentSettled(run: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (document.readyState === "complete") {
    run();
    return () => undefined;
  }

  window.addEventListener("load", run, { once: true });
  return () => window.removeEventListener("load", run);
}

const REMIX_PATHS = {
  "error-warning-line":
  "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"
  +"M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
  +"M11 15H13V17H11V15ZM11 7H13V13H11V7Z",
  "fullscreen-exit-line": "M18 7H22V9H16V3H18V7ZM8 9H2V7H6V3H8V9ZM18 17V21H16V15H22V17H18ZM8 15V21H6V17H2V15H8Z",
  "fullscreen-line": "M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z",
};

type RemixIconName = keyof typeof REMIX_PATHS;

function RemixIcon({ className, name }: { className?: string; name: RemixIconName }) {
  return (
    <svg
    viewBox="0 0 24 24"
    className={className}
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    >
    <path d={REMIX_PATHS[name]} />
    </svg>
  );
}

function EmbedStatus({ label, state }: { label: string; state: EmbedFrameState }) {
  return (
    <div className={frontendClassName("embed-frame-status")} role="status">
    {state === "error"
      ? <RemixIcon name="error-warning-line" className={frontendClassName("embed-frame-mark")} />
      : <div className="loader-circle lg" aria-hidden="true" />}
    <p>{label}</p>
    </div>
  );
}

function FullscreenButton({ label, target }: { label: string; target: HTMLElement | null }) {
  const [active, setActive] = useState(false);

  if (!fullscreenSupported()) return null;
  return (
    <button
    type="button"
    aria-label={label}
    title={label}
    className={frontendClassName("embed-frame-fullscreen")}
    onClick={() => {
          if (!target) return;
          toggleFullscreen(target);
          setActive((value) => !value);
    }}
    >
    <RemixIcon name={active ? "fullscreen-exit-line" : "fullscreen-line"} />
    </button>
  );
}

export function EmbedFrame({
    allowFullScreen,
    aspectRatio,
    className,
    labels,
    onState,
    referrerPolicy,
    sandbox,
    src,
    timeoutMs,
    title,
}: EmbedFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const settled = useRef(false);
  const [state, setState] = useState<EmbedFrameState>("loading");
  const sandboxed = typeof sandbox === "string";

  function settle(next: EmbedFrameState) {
    if (settled.current) return;
    settled.current = true;
    setState(next);
    onState?.(next);
  }

  function clearSource() {
    if (objectRef.current) objectRef.current.removeAttribute("data");
    if (frameRef.current) frameRef.current.src = "about:blank";
  }

  useEffect(() => {
      let timer = 0;
      settled.current = false;
      setState("loading");

      const target: HTMLElement | null = objectRef.current || frameRef.current;
      const onLoad = () => settle("ready");
      const onError = () => {
        settle("error");
        clearSource();
      };

      const start = () => {
        if (objectRef.current) objectRef.current.data = src;
        if (frameRef.current) frameRef.current.src = src;
        timer = window.setTimeout(() => {
            if (settled.current) return;
            onError();
        }, timeoutMs && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS);
      };

      target?.addEventListener("load", onLoad);
      target?.addEventListener("error", onError);
      const stop = whenDocumentSettled(start);
      return () => {
        stop();
        target?.removeEventListener("load", onLoad);
        target?.removeEventListener("error", onError);
        window.clearTimeout(timer);
      };
    }, [src, timeoutMs]);

  const text = state === "error"
    ? labels?.error || DEFAULT_LABELS.error
    : labels?.loading || DEFAULT_LABELS.loading;

  return (
    <div
    ref={rootRef}
    className={[frontendClassName("embed-frame"), className].filter(Boolean).join(" ")}
    data-embed-state={state}
    style={aspectRatio ? { aspectRatio } : undefined}
    >
    {sandboxed ? (
        <iframe
        ref={frameRef}
        allowFullScreen={allowFullScreen}
        loading="lazy"
        referrerPolicy={referrerPolicy}
        sandbox={sandbox}
        title={title}
        />
      ) : (
        <object
        ref={objectRef}
        type="text/html"
        aria-label={title}
        />
      )}
    {state === "ready" ? null : <EmbedStatus label={text} state={state} />}
    {allowFullScreen && !sandboxed && state === "ready" ? (
        <FullscreenButton
        label={labels?.fullscreen || DEFAULT_LABELS.fullscreen}
        target={rootRef.current}
        />
      ) : null}
    </div>
  );
}

export type { EmbedFrameLabels, EmbedFrameProps, EmbedFrameState };
