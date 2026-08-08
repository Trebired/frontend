import { useEffect, useState } from "react";

import { readFullscreenState } from "./shared.js";

function readViewportHeight() {
  const height = typeof window !== "undefined" ? window.innerHeight : 0;
  return Number.isFinite(height) && height > 0 ? height : 900;
}

function useFullscreenState(rootRef: any) {
  const [isFullscreen, setIsFullscreen] = useState(() => readFullscreenState(rootRef.current));
  const [viewportHeight, setViewportHeight] = useState(() => readViewportHeight());
  useEffect(() => {
    function syncFullscreenState() {
      const nextIsFullscreen = readFullscreenState(rootRef.current);
      const nextViewportHeight = readViewportHeight();
      setIsFullscreen((current) => current === nextIsFullscreen ? current : nextIsFullscreen);
      setViewportHeight((current) => current === nextViewportHeight ? current : nextViewportHeight);
    }
    syncFullscreenState();
    document.addEventListener("tbf:fullscreen-open", syncFullscreenState as EventListener);
    document.addEventListener("tbf:fullscreen-close", syncFullscreenState as EventListener);
    window.addEventListener("resize", syncFullscreenState);
    return () => {
      document.removeEventListener("tbf:fullscreen-open", syncFullscreenState as EventListener);
      document.removeEventListener("tbf:fullscreen-close", syncFullscreenState as EventListener);
      window.removeEventListener("resize", syncFullscreenState);
    };
  }, []);
  return { isFullscreen, viewportHeight };
}

export { useFullscreenState };
