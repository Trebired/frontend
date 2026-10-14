import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toText as toCurrentUrl } from "#ndsvdqv80epr";
import { frontendEventName } from "#5vbaqj4pirp3";

type RenderCurrentUrlProviderProps = {
  children?: ReactNode;
  currentUrl?: unknown;
  value?: unknown;
};

const RenderCurrentUrlContext = createContext("");

const SPA_EVENTS = ["page-change", "rehydrate", "live-navigation"];

function subscribeUrl(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const names = SPA_EVENTS.map((name) => frontendEventName(name));
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);
  for (const name of names) document.addEventListener(name, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
    for (const name of names) document.removeEventListener(name, callback);
  };
}

function browserCurrentUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function currentUrlSnapshot(fallback = "") {
  return browserCurrentUrl() || fallback;
}

function RenderCurrentUrlProvider(props: RenderCurrentUrlProviderProps) {
  const currentUrl = toCurrentUrl(props.currentUrl ?? props.value);
  return (
    <RenderCurrentUrlContext.Provider value={currentUrl}>
    {props.children}
    </RenderCurrentUrlContext.Provider>
  );
}

function useRenderCurrentUrl() {
  const currentUrl = toCurrentUrl(useContext(RenderCurrentUrlContext));
  return useSyncExternalStore(
    subscribeUrl,
    () => currentUrlSnapshot(currentUrl),
    () => currentUrl || browserCurrentUrl(),
  );
}

export { RenderCurrentUrlProvider, useRenderCurrentUrl };
export type { RenderCurrentUrlProviderProps };
