import { Icon } from "#lbkpzw8nphru";
import { primitiveButtonClassName } from "#0rl8rpgzssot";
import { frontendClassName, frontendDataAttr } from "#5vbaqj4pirp3";
import { FullscreenCloseButton, FullscreenOpenButton } from "./index.js";

type FullscreenToggleProps = {
  fullscreenId: string;
  group?: string;
  lang?: string;
};

const LABELS: Record<string, { enter: string; exit: string }> = {
  cs: { enter: "Celá obrazovka", exit: "Ukončit celou obrazovku" },
  en: { enter: "Fullscreen", exit: "Exit fullscreen" },
};

function labelsFor(lang?: string) {
  const key = String(lang || "").trim().toLowerCase().slice(0, 2);
  return LABELS[key] || LABELS.en;
}

function FullscreenToggle(props: FullscreenToggleProps) {
  const labels = labelsFor(props.lang);
  const shared = {
    className: primitiveButtonClassName({ icon: true, size: "md", tooltip: true }),
    fullscreenId: props.fullscreenId,
    group: props.group || "default",
  };
  return (
    <span className={frontendClassName("fullscreen-toggle")}>
    <FullscreenOpenButton {...shared} aria-label={labels.enter} title={labels.enter}>
    <Icon spec="remixicon fullscreen-line" />
    </FullscreenOpenButton>
    <FullscreenCloseButton
    {...shared}
    aria-label={labels.exit}
    title={labels.exit}
    {...{ [frontendDataAttr("fullscreen-hidden")]: "true" }}
    >
    <Icon spec="remixicon fullscreen-exit-line" />
    </FullscreenCloseButton>
    </span>
  );
}

export { FullscreenToggle };
export type { FullscreenToggleProps };
