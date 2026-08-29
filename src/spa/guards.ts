type UnsavedWorkCheck = () => boolean;

const checks = new Set<UnsavedWorkCheck>();

function registerUnsavedWork(check: UnsavedWorkCheck): () => void {
  if (typeof check !== "function") return () => {};
  checks.add(check);
  return () => {
    checks.delete(check);
  };
}

function hasUnsavedWork() {
  for (const check of Array.from(checks)) {
    try {
      if (check() === true) return true;
    } catch {
      // a broken check must not strand the user on the page
    }
  }
  return false;
}

function unsavedWorkCheckCount() {
  return checks.size;
}

export { hasUnsavedWork, registerUnsavedWork, unsavedWorkCheckCount };
export type { UnsavedWorkCheck };
