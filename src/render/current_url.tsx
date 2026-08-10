import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type RenderCurrentUrlProviderProps = {
  children?: ReactNode;
  currentUrl?: unknown;
  value?: unknown;
};

const RenderCurrentUrlContext = createContext("");

function toCurrentUrl(value: unknown) {
  return String(value ?? "").trim();
}

function subscribeUrl(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
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
    () => currentUrl,
  );
}

export { RenderCurrentUrlProvider, useRenderCurrentUrl };
export type { RenderCurrentUrlProviderProps };
