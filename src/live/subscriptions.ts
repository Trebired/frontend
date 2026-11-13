type LiveSubscriptionCleanup = () => void;

function disconnectLiveSubscriptionHost(
  host: HTMLElement,
  state: {
    bound: WeakSet<HTMLElement>;
    cleanups: WeakMap<HTMLElement, LiveSubscriptionCleanup>;
  },
) {
  const cleanup = state.cleanups.get(host);
  if (cleanup) {
    try {
      cleanup();
    } catch {}
  }
  state.cleanups.delete(host);
  state.bound.delete(host);
  return Boolean(cleanup);
}

export { disconnectLiveSubscriptionHost };
export type { LiveSubscriptionCleanup };
