import { useEffect, useRef, useState } from "react";

import { frontendClassName } from "#5vbaqj4pirp3";

type EmbedFrameLabels = {
  error?: string;
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
  error: "This content could not be loaded. It may be unreachable or taking too long to respond.",
  loading: "Loading…",
};

function WarningMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
    <path
    d="M12 3.2 1.8 20.8h20.4L12 3.2Zm0 5.6a1 1 0 0 1 1 1v4.6a1 1 0 0 1-2 0V9.8a1 1 0 0 1 1-1Zm0 8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"
    fill="currentColor"
    />
    </svg>
  );
}

function whenDocumentSettled(run: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (document.readyState === "complete") {
    run();
    return () => undefined;
  }

  window.addEventListener("load", run, { once: true });
  return () => window.removeEventListener("load", run);
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
  const frameRef = useRef<HTMLIFrameElement>(null);
  const settled = useRef(false);
  const [state, setState] = useState<EmbedFrameState>("loading");

  function settle(next: EmbedFrameState) {
    if (settled.current) return;
    settled.current = true;
    setState(next);
    onState?.(next);
  }

  useEffect(() => {
      let timer = 0;
      settled.current = false;

      const start = () => {
        const frame = frameRef.current;
        if (!frame) return;
        frame.src = src;
        timer = window.setTimeout(() => {
            if (settled.current) return;
            settle("error");
            if (frameRef.current) frameRef.current.src = "about:blank";
        }, timeoutMs && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS);
      };

      const stop = whenDocumentSettled(start);
      return () => {
        stop();
        window.clearTimeout(timer);
      };
    }, [src, timeoutMs]);

  const text = state === "error"
    ? labels?.error || DEFAULT_LABELS.error
    : labels?.loading || DEFAULT_LABELS.loading;

  return (
    <div
    className={[frontendClassName("embed-frame"), className].filter(Boolean).join(" ")}
    data-embed-state={state}
    style={aspectRatio ? { aspectRatio } : undefined}
    >
    <iframe
    ref={frameRef}
    allowFullScreen={allowFullScreen}
    loading="lazy"
    referrerPolicy={referrerPolicy}
    sandbox={sandbox}
    title={title}
    onLoad={() => settle("ready")}
    />
    {state === "ready" ? null : (
        <div className={frontendClassName("embed-frame-status")} role="status">
        {state === "error" ? <WarningMark /> : <div className="loader-circle lg" aria-hidden="true" />}
        <p>{text}</p>
        </div>
    )}
    </div>
  );
}

export type { EmbedFrameLabels, EmbedFrameProps, EmbedFrameState };
