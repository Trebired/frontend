type NavigationGuard = (url: string) => boolean | Promise<boolean>;

type NavigationGuardOptions = {
  pending?: () => boolean;
};

const guards = new Map<NavigationGuard, NavigationGuardOptions>();
let reloadBound = false;
let bypassUnloadPrompt = false;

function unloadPromptBypassed() {
  return bypassUnloadPrompt;
}

function registerNavigationGuard(
  guard: NavigationGuard,
  options: NavigationGuardOptions = {},
): () => void {
  if (typeof guard !== "function") return () => {};
  guards.set(guard, options);
  return () => {
    guards.delete(guard);
  };
}

async function navigationAllowed(url: string) {
  for (const guard of Array.from(guards.keys())) {
    let allowed = true;
    try {
      allowed = (await guard(url)) !== false;
    } catch {
      allowed = true;
    }
    if (!allowed) return false;
  }
  return true;
}

function navigationPending() {
  for (const options of Array.from(guards.values())) {
    try {
      if (options.pending?.() === true) return true;
    } catch {
      // a broken predicate must not block the shortcut
    }
  }
  return false;
}

function navigationGuardCount() {
  return guards.size;
}

function isReloadShortcut(event: KeyboardEvent) {
  if (event.altKey) return false;
  if (event.key === "F5") return !event.ctrlKey && !event.metaKey && !event.shiftKey;
  if (!event.ctrlKey && !event.metaKey) return false;
  return event.key === "r" || event.key === "R";
}

async function confirmGuardedReload() {
  if (!(await navigationAllowed(window.location.href))) return;
  bypassUnloadPrompt = true;
  window.location.reload();
}

function bindGuardedReload() {
  if (reloadBound || typeof window === "undefined") return () => {};
  reloadBound = true;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !isReloadShortcut(event)) return;
    if (!navigationPending()) return;
    event.preventDefault();
    void confirmGuardedReload();
  };
  window.addEventListener("keydown", onKeyDown, true);
  return () => {
    window.removeEventListener("keydown", onKeyDown, true);
    reloadBound = false;
  };
}

export {
  bindGuardedReload,
  navigationAllowed,
  navigationGuardCount,
  navigationPending,
  registerNavigationGuard,
  unloadPromptBypassed,
};
export type { NavigationGuard, NavigationGuardOptions };
