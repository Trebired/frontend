type NavigationGuard = (url: string) => boolean | Promise<boolean>;

const guards = new Set<NavigationGuard>();

function registerNavigationGuard(guard: NavigationGuard): () => void {
  if (typeof guard !== "function") return () => {};
  guards.add(guard);
  return () => {
    guards.delete(guard);
  };
}

async function navigationAllowed(url: string) {
  for (const guard of Array.from(guards)) {
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

function navigationGuardCount() {
  return guards.size;
}

export { navigationAllowed, navigationGuardCount, registerNavigationGuard };
export type { NavigationGuard };
