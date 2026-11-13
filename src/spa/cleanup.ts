type PageCleanup = () => void;

type CleanupEntry = {
  dispose: PageCleanup;
  root: HTMLElement | null;
};

const entries = new Set<CleanupEntry>();

function isInsideRemovedRoot(entry: CleanupEntry, removed: HTMLElement | null) {
  if (!entry.root) return true;
  if (!removed) return true;
  return removed === entry.root || removed.contains(entry.root);
}

function registerPageCleanup(
  root: HTMLElement | null,
  dispose: PageCleanup,
): () => void {
  if (typeof dispose !== "function") return () => {};
  const entry: CleanupEntry = {
    dispose,
    root: root instanceof HTMLElement ? root : null,
  };
  entries.add(entry);
  return () => {
    entries.delete(entry);
  };
}

function runPageCleanups(removed: HTMLElement | null) {
  for (const entry of Array.from(entries)) {
    if (!isInsideRemovedRoot(entry, removed)) continue;
    entries.delete(entry);
    try {
      entry.dispose();
    } catch {
    }
  }
}

function runCleanupsWithin(container: HTMLElement) {
  for (const entry of Array.from(entries)) {
    if (!entry.root || entry.root === container || !container.contains(entry.root)) continue;
    entries.delete(entry);
    try {
      entry.dispose();
    } catch {
    }
  }
}

function pageCleanupCount() {
  return entries.size;
}

export { pageCleanupCount, registerPageCleanup, runCleanupsWithin, runPageCleanups };
export type { PageCleanup };
