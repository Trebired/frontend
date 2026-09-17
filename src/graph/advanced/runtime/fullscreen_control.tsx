import React, { useEffect, useState } from "react";
import { createLocalTranslator, icon } from "#4fte8m1x62rd";
import { documentLanguageTag as documentLang } from "#er0dlx1gtbzh";
import { primitiveButtonClassName } from "#hzrmwbvgt2ax";
import { closeFullscreenTarget, openFullscreenTarget } from "#e1wjbzbsyghi";
import { frontendEventName } from "#5vbaqj4pirp3";

function matchesPanel(event: Event, id: string, group: string) {
  const detail = (event as CustomEvent).detail || {};
  return String(detail.id || "") === id && String(detail.group || "") === group;
}

function useFullscreenOpen(id: string, group: string) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
      if (!id || typeof document === "undefined") return undefined;
      const onOpen = (event: Event) => {
        if (matchesPanel(event, id, group)) setOpen(true);
      };
      const onClose = (event: Event) => {
        if (matchesPanel(event, id, group)) setOpen(false);
      };
      document.addEventListener(frontendEventName("fullscreen-open"), onOpen);
      document.addEventListener(frontendEventName("fullscreen-close"), onClose);
      return () => {
        document.removeEventListener(frontendEventName("fullscreen-open"), onOpen);
        document.removeEventListener(frontendEventName("fullscreen-close"), onClose);
      };
    }, [id, group]);
  return open;
}

function GraphFullscreenControl(props: { fullscreenGroup?: string; fullscreenId?: string }) {
  const id = String(props.fullscreenId || "");
  const group = String(props.fullscreenGroup || "graphs");
  const open = useFullscreenOpen(id, group);
  if (!id) return null;
  const localT = createLocalTranslator(import.meta.url, documentLang());
  const label = open ? localT("display.exitFullscreen") : localT("display.fullscreen");
  return React.createElement(
    "button",
    {
      "aria-label": label,
      className: primitiveButtonClassName({ icon: true, size: "md", tooltip: true }),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (open) closeFullscreenTarget();
        else openFullscreenTarget(id, group, event.currentTarget);
      },
      title: label,
      type: "button",
    },
    icon({ spec: open ? "remixicon fullscreen-exit-line" : "remixicon fullscreen-line" }),
  );
}

export { GraphFullscreenControl };
