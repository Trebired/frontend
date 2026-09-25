import { useEffect, useRef, useState } from "react";

import { frontendClassName } from "#5vbaqj4pirp3";
import { fullscreenSupported, toggleFullscreen } from "#e1wjbzbsyghi";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { useResolvedLang } from "./lang.js";

type EmbedFrameLabels = {
  fullscreen?: string;
  loading?: string;
};

type EmbedFrameProps = {
  allowFullScreen?: boolean;
  aspectRatio?: string;
  className?: string;
  labels?: EmbedFrameLabels;
  lang?: string;
  onState?: (state: EmbedFrameState) => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  sandbox?: string;
  src: string;
  timeoutMs?: number;
  title: string;
};

type EmbedFrameState = "error" | "loading" | "ready";
type EmbedFrameFailureReason = "offline" | "refused" | "timeout" | "unreachable";

type EmbedRefs = {
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  objectRef: React.RefObject<HTMLObjectElement | null>;
};

const DEFAULT_TIMEOUT_MS = 10000;

const DEFAULT_LABELS: Required<EmbedFrameLabels> = {
  fullscreen: "Toggle fullscreen",
  loading: "Loading…",
};

const FAILURE_KEYS: Record<EmbedFrameFailureReason, string> = {
  offline: "embedFailedOffline",
  refused: "embedFailedRefused",
  timeout: "embedFailedTimeout",
  unreachable: "embedFailedUnreachable",
};

async function classifyFailure(src: string): Promise<EmbedFrameFailureReason> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  try {
    await fetch(src, { cache: "no-store", mode: "no-cors" });
    return "refused";
  } catch {
    return "unreachable";
  }
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

function whenDocumentSettled(run: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (document.readyState === "complete") {
    run();
    return () => undefined;
  }

  window.addEventListener("load", run, { once: true });
  return () => window.removeEventListener("load", run);
}

function EmbedStatus({ headline, reason }: { headline: string; reason?: string }) {
  return (
    <div className={frontendClassName("embed-frame-status")} role="status">
    {reason
      ? <RemixIcon name="error-warning-line" className={frontendClassName("embed-frame-mark")} />
      : <div className="loader-circle lg" aria-hidden="true" />}
    <p className={frontendClassName("embed-frame-headline")}>{headline}</p>
    {reason ? <p className={frontendClassName("embed-frame-reason")}>{reason}</p> : null}
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

function EmbedSurface({ props, refs }: { props: EmbedFrameProps; refs: EmbedRefs }) {
  if (typeof props.sandbox === "string") {
    return (
      <iframe
      ref={refs.frameRef}
      allowFullScreen={props.allowFullScreen}
      loading="lazy"
      referrerPolicy={props.referrerPolicy}
      sandbox={props.sandbox}
      title={props.title}
      />
    );
  }
  return <object ref={refs.objectRef} type="text/html" aria-label={props.title} />;
}

type EmbedLifecycleResult = EmbedRefs & { failureReason: EmbedFrameFailureReason; state: EmbedFrameState };

function clearEmbedSource(refs: EmbedRefs): void {
  if (refs.objectRef.current) refs.objectRef.current.removeAttribute("data");
  if (refs.frameRef.current) refs.frameRef.current.src = "about:blank";
}

function bindEmbedLifecycle(
  refs: EmbedRefs,
  props: EmbedFrameProps,
  settle: (state: EmbedFrameState, reason?: EmbedFrameFailureReason) => void,
): () => void {
  let timer = 0;
  const target: HTMLElement | null = refs.objectRef.current || refs.frameRef.current;
  const onLoad = () => {
    window.clearTimeout(timer);
    settle("ready");
  };
  const fail = (reason: EmbedFrameFailureReason) => {
    settle("error", reason);
    clearEmbedSource(refs);
  };
  const onError = () => {
    void classifyFailure(props.src).then(fail);
  };
  const start = () => {
    if (refs.objectRef.current) refs.objectRef.current.data = props.src;
    if (refs.frameRef.current) refs.frameRef.current.src = props.src;
    const timeout = props.timeoutMs && props.timeoutMs > 0 ? props.timeoutMs : DEFAULT_TIMEOUT_MS;
    timer = window.setTimeout(() => fail("timeout"), timeout);
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
}

function useEmbedLifecycle(props: EmbedFrameProps): EmbedLifecycleResult {
  const objectRef = useRef<HTMLObjectElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const report = useRef(props.onState);
  const settled = useRef(false);
  const [state, setState] = useState<EmbedFrameState>("loading");
  const [failureReason, setFailureReason] = useState<EmbedFrameFailureReason>("timeout");
  const { src, timeoutMs } = props;

  report.current = props.onState;
  useEffect(() => {
      settled.current = false;
      setState("loading");
      const refs = { frameRef, objectRef };
      const settle = (next: EmbedFrameState, reason?: EmbedFrameFailureReason) => {
        if (settled.current) return;
        settled.current = true;
        if (reason) setFailureReason(reason);
        setState(next);
        report.current?.(next);
      };
      return bindEmbedLifecycle(refs, props, settle);
    }, [src, timeoutMs]);

  return { failureReason, frameRef, objectRef, state };
}

export function EmbedFrame(props: EmbedFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { failureReason, frameRef, objectRef, state } = useEmbedLifecycle(props);
  const { allowFullScreen, aspectRatio, className, labels, sandbox } = props;
  const lang = useResolvedLang(props.lang);
  const failed = state === "error";
  const headline = failed
  ? sourceLanguageMessage("embedFailed", lang)
  : labels?.loading || DEFAULT_LABELS.loading;
  const reason = failed ? sourceLanguageMessage(FAILURE_KEYS[failureReason], lang) : undefined;

  return (
    <div
    ref={rootRef}
    className={[frontendClassName("embed-frame"), className].filter(Boolean).join(" ")}
    data-embed-state={state}
    style={aspectRatio ? { aspectRatio } : undefined}
    >
    <EmbedSurface props={props} refs={{ frameRef, objectRef }} />
    {state === "ready" ? null : <EmbedStatus headline={headline} reason={reason} />}
    {allowFullScreen && typeof sandbox !== "string" && state === "ready" ? (
        <FullscreenButton
        label={labels?.fullscreen || DEFAULT_LABELS.fullscreen}
        target={rootRef.current}
        />
      ) : null}
    </div>
  );
}

export type { EmbedFrameLabels, EmbedFrameProps, EmbedFrameState };
