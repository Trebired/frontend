import {
  serverObject,
  serverString,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./../http.js";
import { resolveFrontendServerLogger, type FrontendServerLoggerInput } from "./../logging.js";
import {
  buildSidebarLiveDescriptor,
  normalizeSidebarLiveItem,
  type SidebarLiveDescriptor,
  type SidebarLiveParams,
  type SidebarLiveResolveContext,
} from "./live.js";

type SidebarSourceContext = {
  params: SidebarLiveParams;
  path: string;
  req: ServerRequestLike;
  res: ServerResponseLike;
  side: "left" | "right";
  type: string;
};

type SidebarSourceOptions = {
  counts: (context: SidebarSourceContext) => unknown | Promise<unknown>;
  logger?: FrontendServerLoggerInput;
  rooms: (type: string, params: SidebarLiveParams) => readonly string[];
  scope?: (context: SidebarSourceContext) => unknown | Promise<unknown>;
};

type SidebarSourceResult = {
  entity_counts: unknown;
  key: string;
  resolved: boolean;
  side: "left" | "right";
  type: string;
};

type SidebarSource = {
  hydrate: (context: {
      req: ServerRequestLike;
      res: ServerResponseLike;
      side: string;
      sidebar: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  resolve: (context: Pick<SidebarLiveResolveContext, "items"|"req"|"res">) => Promise<SidebarSourceResult[]>;
};

let appSidebarSource: SidebarSource | null = null;

function currentSidebarSource() {
  return appSidebarSource;
}

function ownValues(values: Record<string, unknown>): PropertyDescriptorMap {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, {
          configurable: true,
          enumerable: true,
          value,
          writable: true,
  }]));
}

function sidebarSourceRequest(req: ServerRequestLike, descriptor: SidebarLiveDescriptor) {
  const next = Object.assign(Object.create(Object.getPrototypeOf(req ?? {})), req);
  return Object.defineProperties(next, ownValues({
        originalUrl: descriptor.path,
        params: descriptor.params,
        path: descriptor.path,
        url: descriptor.path,
  })) as ServerRequestLike;
}

function sidebarSourceResponse(res: ServerResponseLike) {
  const next = Object.assign(Object.create(Object.getPrototypeOf(res ?? {})), res);
  return Object.defineProperties(next, ownValues({ locals: { ...serverObject(res?.locals) } })) as ServerResponseLike;
}

function createSidebarSource(options: SidebarSourceOptions): SidebarSource {
  const logger = resolveFrontendServerLogger(options.logger);
  const protocol = { roomsForType: options.rooms };

  function warn(message: string, type: string, error: unknown) {
    logger.warn("sidebar", message, {
        error: error instanceof Error ? error.message : String(error),
        type,
    });
  }

  async function hydrate(context: Parameters<SidebarSource["hydrate"]>[0]) {
    const type = serverString(context.sidebar.type).trim();
    const live = buildSidebarLiveDescriptor(context.side, type, context.req, protocol);
    if (!live) return { ...context.sidebar, entity_counts: {}, live: null };
    try {
      const counts = await options.counts({ ...live, req: context.req, res: context.res });
      return { ...context.sidebar, entity_counts: serverObject(counts), live };
    } catch (error) {
      warn("sidebar counts failed", type, error);
      return { ...context.sidebar, entity_counts: {}, live };
    }
  }

  async function resolveItem(item: SidebarLiveDescriptor, req: ServerRequestLike, res: ServerResponseLike) {
    const descriptor = normalizeSidebarLiveItem(item, protocol);
    const base = { key: descriptor?.key || serverString(item.key), side: item.side, type: item.type };
    if (!descriptor || !descriptor.rooms.length) return { ...base, entity_counts: null, resolved: false };
    try {
      const context = {
        ...descriptor,
        req: sidebarSourceRequest(req, descriptor),
        res: sidebarSourceResponse(res),
      };
      await options.scope?.(context);
      return { ...base, entity_counts: serverObject(await options.counts(context)), resolved: true };
    } catch (error) {
      warn("sidebar refresh failed", descriptor.type, error);
      return { ...base, entity_counts: null, resolved: false };
    }
  }

  appSidebarSource = {
    hydrate,
    resolve: ({ items, req, res }) => Promise.all(items.map((item) => resolveItem(item, req, res))),
  };
  return appSidebarSource;
}

export { createSidebarSource, currentSidebarSource };
export type { SidebarSource, SidebarSourceContext, SidebarSourceOptions, SidebarSourceResult };
