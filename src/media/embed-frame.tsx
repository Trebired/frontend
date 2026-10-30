import { useEffect, useRef, useState } from "react";

import { button as Button } from "#6hfutrhvm6x6";
import { frontendClassName, frontendClassNames, frontendDataAttrs } from "#5vbaqj4pirp3";
import { fullscreenSupported, toggleFullscreen } from "#e1wjbzbsyghi";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { frontendFrameAttrs } from "./frames.js";
import { useResolvedLang } from "./lang.js";

type EmbedFrameLabels = {
  fullscreen?: string;
  loading?: string;
};

type EmbedFrameConsent = {
  provider: string;
};

type EmbedFrameProps = {
  allowFullScreen?: boolean;
  aspectRatio?: string;
  className?: string;
  consent?: EmbedFrameConsent;
  labels?: EmbedFrameLabels;
  lang?: string;
  onState?: (state: EmbedFrameState) => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  sandbox?: string;
  src: string;
  timeoutMs?: number;
  title: string;
};

type EmbedFrameState = "consent" | "error" | "loading" | "ready";
type EmbedFrameFailureReason = "offline" | "refused" | "timeout" | "unreachable";

type EmbedRefs = {
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  objectRef: React.RefObject<HTMLObjectElement | null>;
};

const DEFAULT_TIMEOUT_MS = 10000;

const CONSENT_EVENT = "trebired:embed-consent";

const CONSENT_KEY = "trebired.embed-consent.";

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
  "eye-line":
  "M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21"
  +"C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19"
  +"C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12"
  +"C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12"
  +"C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12"
  +"C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12"
  +"C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12"
  +"C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z",
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

function consentGranted(provider: string): boolean {
  try {
    return window.localStorage.getItem(`${CONSENT_KEY}${provider}`) === "granted";
  } catch {
    return false;
  }
}

function rememberConsent(provider: string): void {
  try {
    window.localStorage.setItem(`${CONSENT_KEY}${provider}`, "granted");
  } catch {
    return;
  } finally {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: provider }));
  }
}

function useEmbedConsent(consent?: EmbedFrameConsent): { grant: () => void; granted: boolean } {
  const provider = consent?.provider;
  const [granted, setGranted] = useState(!provider);

  useEffect(() => {
      if (!provider) {
        setGranted(true);
        return undefined;
      }
      if (consentGranted(provider)) setGranted(true);
      const onGrant = (event: Event) => {
        if ((event as CustomEvent<string>).detail === provider) setGranted(true);
      };
      window.addEventListener(CONSENT_EVENT, onGrant);
      return () => window.removeEventListener(CONSENT_EVENT, onGrant);
    }, [provider]);

  return {
    grant: () => {
      if (provider) rememberConsent(provider);
      setGranted(true);
    },
    granted,
  };
}

function EmbedConsent({ grant, lang, provider }: { grant: () => void; lang: string; provider: string }) {
  return (
    <div className={frontendClassName("embed-frame-status")}>
    <p className={frontendClassName("embed-frame-headline")}>{sourceLanguageMessage("embedConsent", lang, { provider })}</p>
    <p className={frontendClassName("embed-frame-reason")}>{sourceLanguageMessage("embedConsentReason", lang, { provider })}</p>
    <Button size="sm" type="button" variant="primary" onClick={grant}>
    <RemixIcon name="eye-line" />
    {sourceLanguageMessage("embedConsentAction", lang)}
    </Button>
    </div>
  );
}

function EmbedStatus({ headline, reason }: { headline: string; reason?: string }) {
  return (
    <div className={frontendClassName("embed-frame-status")} role="status">
    {reason
      ? <RemixIcon name="error-warning-line" className={frontendClassName("embed-frame-mark")} />
      : <div className={frontendClassNames("loader-circle", "lg")} aria-hidden="true" />}
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
      {...frontendFrameAttrs()}
      allowFullScreen={props.allowFullScreen}
      loading="lazy"
      referrerPolicy={props.referrerPolicy}
      sandbox={props.sandbox}
      title={props.title}
      />
    );
  }
  return <object ref={refs.objectRef} {...frontendFrameAttrs()} type="text/html" aria-label={props.title} />;
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

function useEmbedLifecycle(props: EmbedFrameProps, granted: boolean): EmbedLifecycleResult {
  const objectRef = useRef<HTMLObjectElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const report = useRef(props.onState);
  const settled = useRef(false);
  const [state, setState] = useState<EmbedFrameState>(props.consent ? "consent" : "loading");
  const [failureReason, setFailureReason] = useState<EmbedFrameFailureReason>("timeout");
  const { src, timeoutMs } = props;

  report.current = props.onState;
  useEffect(() => {
      if (!granted) {
        setState("consent");
        return undefined;
      }
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
    }, [granted, src, timeoutMs]);

  return { failureReason, frameRef, objectRef, state };
}

export function EmbedFrame(props: EmbedFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { grant, granted } = useEmbedConsent(props.consent);
  const { failureReason, frameRef, objectRef, state } = useEmbedLifecycle(props, granted);
  const { allowFullScreen, aspectRatio, className, consent, labels, sandbox } = props;
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
    {...frontendDataAttrs({ "embed-state": state })}
    style={aspectRatio ? { aspectRatio } : undefined}
    >
    <EmbedSurface props={props} refs={{ frameRef, objectRef }} />
    {state === "consent" && consent ? <EmbedConsent grant={grant} lang={lang} provider={consent.provider} /> : null}
    {state === "ready" || state === "consent" ? null : <EmbedStatus headline={headline} reason={reason} />}
    {allowFullScreen && typeof sandbox !== "string" && state === "ready" ? (
        <FullscreenButton
        label={labels?.fullscreen || DEFAULT_LABELS.fullscreen}
        target={rootRef.current}
        />
      ) : null}
    </div>
  );
}

export type { EmbedFrameConsent, EmbedFrameLabels, EmbedFrameProps, EmbedFrameState };
