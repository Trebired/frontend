type OverlayCloser = () => void;

const closers = new Set<OverlayCloser>();

function registerOverlayCloser(closer: OverlayCloser) {
  closers.add(closer);
  return () => {
    closers.delete(closer);
  };
}

function runOverlayClosers() {
  closers.forEach((closer) => {
      try {
        closer();
      } catch {
        return;
      }
  });
}

export { registerOverlayCloser, runOverlayClosers };
export type { OverlayCloser };
