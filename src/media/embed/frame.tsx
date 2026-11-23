import { frontendClassName, frontendClassNames, frontendDataAttrs } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { primitiveButtonClassName } from "#0rl8rpgzssot";
import { REMIX_PATHS } from "./paths.js";
import { frontendFrameAttrs } from "./../frames.js";
import { useResolvedLang } from "./../lang.js";

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
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  sandbox?: string;
  src: string;
  timeoutMs?: number;
  title: string;
};

type EmbedFrameState = "consent" | "error" | "loading" | "ready";

const DEFAULT_TIMEOUT_MS = 10000;

const DEFAULT_LABELS: Required<EmbedFrameLabels> = {
  fullscreen: "Toggle fullscreen",
  loading: "Loading…",
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

function EmbedConsent({ lang, provider }: { lang: string; provider: string }) {
  return (
    <div className={frontendClassName("embed-frame-status")} {...frontendDataAttrs({ "embed-consent": "" })}>
    <p className={frontendClassName("embed-frame-headline")}>{sourceLanguageMessage("embedConsent", lang, { provider })}</p>
    <p className={frontendClassName("embed-frame-reason")}>{sourceLanguageMessage("embedConsentReason", lang, { provider })}</p>
    <button
    className={primitiveButtonClassName({ size: "sm", variant: "primary" })}
    type="button"
    {...frontendDataAttrs({ "embed-grant": "" })}
    >
    <RemixIcon name="eye-line" />
    {sourceLanguageMessage("embedConsentAction", lang)}
    </button>
    </div>
  );
}

function EmbedStatus({ hidden, loading }: { hidden: boolean; loading: string }) {
  return (
    <div className={frontendClassName("embed-frame-status")} hidden={hidden} role="status" {...frontendDataAttrs({ "embed-status": "" })}>
    <div className={frontendClassNames("loader-circle", "lg")} aria-hidden="true" />
    <span className={frontendClassName("embed-frame-mark")} hidden><RemixIcon name="error-warning-line" /></span>
    <p className={frontendClassName("embed-frame-headline")}>{loading}</p>
    <p className={frontendClassName("embed-frame-reason")} hidden />
    </div>
  );
}

function FullscreenButton({ label }: { label: string }) {
  return (
    <button
    type="button"
    aria-label={label}
    title={label}
    className={frontendClassName("embed-frame-fullscreen")}
    hidden
    {...frontendDataAttrs({ "embed-fullscreen": "" })}
    >
    <RemixIcon name="fullscreen-line" />
    </button>
  );
}

function EmbedSurface({ props }: { props: EmbedFrameProps }) {
  if (typeof props.sandbox === "string") {
    return (
      <iframe
      {...frontendFrameAttrs()}
      allowFullScreen={props.allowFullScreen}
      loading="lazy"
      referrerPolicy={props.referrerPolicy}
      sandbox={props.sandbox}
      title={props.title}
      />
    );
  }
  return <object {...frontendFrameAttrs()} type="text/html" aria-label={props.title} />;
}

export function EmbedFrame(props: EmbedFrameProps) {
  const { allowFullScreen, aspectRatio, className, consent, labels, sandbox } = props;
  const lang = useResolvedLang(props.lang);
  const timeout = props.timeoutMs && props.timeoutMs > 0 ? props.timeoutMs : DEFAULT_TIMEOUT_MS;
  return (
    <div
    className={[frontendClassName("embed-frame"), className].filter(Boolean).join(" ")}
    {...frontendDataAttrs({
          "embed-lang": lang,
          "embed-provider": consent?.provider,
          "embed-src": props.src,
          "embed-state": consent ? "consent" : "loading",
          "embed-timeout": String(timeout),
    })}
    style={aspectRatio ? { aspectRatio } : undefined}
    >
    <EmbedSurface props={props} />
    {consent ? <EmbedConsent lang={lang} provider={consent.provider} /> : null}
    <EmbedStatus hidden={Boolean(consent)} loading={labels?.loading || DEFAULT_LABELS.loading} />
    {allowFullScreen && typeof sandbox !== "string" ? <FullscreenButton label={labels?.fullscreen || DEFAULT_LABELS.fullscreen} /> : null}
    </div>
  );
}

export type { EmbedFrameConsent, EmbedFrameLabels, EmbedFrameProps, EmbedFrameState };
