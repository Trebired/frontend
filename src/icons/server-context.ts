type ServerIconCacheEntry = {
  colorMode?: string;
  colorValue?: string;
  normalizedSpec?: string;
  svg?: string;
};

type ServerIconRenderer = (spec: string) => ServerIconCacheEntry | null | undefined;

const GLOBAL_HOLDER_KEY = Symbol.for ("frontend.icon.active_server_renderer");

function activeRendererHolder(): { current: ServerIconRenderer | null } {
  const holder = (globalThis as Record<symbol, {current:ServerIconRenderer|null}|undefined>)[GLOBAL_HOLDER_KEY];
  if (holder) return holder;
  const created = { current: null };
  (globalThis as Record<symbol, {current:ServerIconRenderer|null}|undefined>)[GLOBAL_HOLDER_KEY] = created;
  return created;
}

function withIconServerRenderer<T>(renderer: ServerIconRenderer | null | undefined, render: () => T): T {
  const holder = activeRendererHolder();
  const previous = holder.current;
  holder.current = renderer || null;
  try {
    return render();
  } finally {
    holder.current = previous;
  }
}

function getActiveIconServerRenderer(): ServerIconRenderer | null {
  return activeRendererHolder().current;
}

export { getActiveIconServerRenderer, withIconServerRenderer };
export type { ServerIconCacheEntry, ServerIconRenderer };
