import {
  requestBody,
  sendJson,
  serverObject,
  serverString,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

type SidebarLiveParams = Record<string, string>;

type SidebarLiveDescriptor = {
  key?: string;
  params: SidebarLiveParams;
  path: string;
  rooms: string[];
  side: "left" | "right";
  type: string;
};

type SidebarLiveProtocolOptions = {
  roomsForType?: (type: string, params: SidebarLiveParams) => readonly string[];
};

type SidebarLiveResolveContext = {
  items: SidebarLiveDescriptor[];
  req: ServerRequestLike;
  res: ServerResponseLike;
};

type SidebarLiveRouteOptions = SidebarLiveProtocolOptions& {
  middleware?: unknown | readonly unknown[];
  path?: string;
  resolve: (context: SidebarLiveResolveContext) => unknown | Promise<unknown>;
  respond?: (context: SidebarLiveResolveContext& { result: unknown }) => unknown;
};

function normalizeSidebarLivePath(value: unknown) {
  const path = serverString(value).trim();
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path.replace(/^\/+/u, "")}`;
}

function normalizeSidebarLiveSide(value: unknown) {
  const side = serverString(value).trim().toLowerCase();
  return side === "right" ? "right" : "left";
}

function normalizeSidebarLiveParams(input: unknown) {
  const source = serverObject(input);
  const out: SidebarLiveParams = {};
  for (const [key, value] of Object.entries(source)) {
    const nextKey = serverString(key).trim();
    const nextValue = serverString(value).trim();
    if (nextKey && nextValue) out[nextKey] = nextValue;
  }
  return out;
}

function sidebarLiveRooms(
  type: string,
  params: SidebarLiveParams,
  options: SidebarLiveProtocolOptions = {},
) {
  const rooms = options.roomsForType ? options.roomsForType(type, params) : [];
  return Array.from(rooms).map((room) => serverString(room).trim()).filter(Boolean);
}

function normalizeSidebarLiveItem(
  input: unknown,
  options: SidebarLiveProtocolOptions = {},
): SidebarLiveDescriptor | null {
  const item = serverObject(input);
  const type = serverString(item.type).trim();
  const path = normalizeSidebarLivePath(item.path);
  if (!type || !path) return null;
  const params = normalizeSidebarLiveParams(item.params);
  const side = normalizeSidebarLiveSide(item.side);
  return {
    key:
    serverString(item.key).trim() ||
      `${side}:${type}:${path}:${JSON.stringify(params)}`,
    params,
    path,
    rooms: sidebarLiveRooms(type, params, options),
    side,
    type,
  };
}

function readSidebarLiveItems(
  body: unknown,
  options: SidebarLiveProtocolOptions = {},
) {
  const source = serverObject(body);
  if (!Array.isArray(source.sidebars)) return [];
  return source.sidebars
  .map((item) => normalizeSidebarLiveItem(item, options))
  .filter(Boolean) as SidebarLiveDescriptor[];
}

function buildSidebarLiveDescriptor(
  side: unknown,
  type: unknown,
  req: ServerRequestLike,
  options: SidebarLiveProtocolOptions = {},
) {
  const sidebarType = serverString(type).trim();
  const params = normalizeSidebarLiveParams((req as any)?.params);
  const path = normalizeSidebarLivePath(
    (req as any)?.originalUrl || (req as any)?.url || (req as any)?.path,
  );
  if (!sidebarType || !path) return null;
  return {
    params,
    path,
    rooms: sidebarLiveRooms(sidebarType, params, options),
    side: normalizeSidebarLiveSide(side),
    type: sidebarType,
  } satisfies SidebarLiveDescriptor;
}

function roomFromSidebarLiveDescriptor(descriptor: SidebarLiveDescriptor | null) {
  return descriptor ? descriptor.rooms : [];
}

function createSidebarLiveRefreshHandler(options: SidebarLiveRouteOptions) {
  return async function sidebarLiveRefreshHandler(
    req: ServerRequestLike,
    res: ServerResponseLike,
  ) {
    const items = readSidebarLiveItems(requestBody(req), options);
    const context = { items, req, res };
    const result = await options.resolve(context);
    if (options.respond) return options.respond({ ...context, result });
    return sendJson(res, { data: { sidebars: result }, ok: true });
  };
}

function sidebarLiveMiddlewareList(options: SidebarLiveRouteOptions) {
  if (Array.isArray(options.middleware)) return [...options.middleware];
  return options.middleware ? [options.middleware] : [];
}

function attachSidebarLiveRoute(app: unknown, options: SidebarLiveRouteOptions) {
  if (!(app && typeof (app as { post?: unknown }).post === "function")) return false;
  const post = (app as { post: (...args: unknown[]) => unknown }).post.bind(app);
  post(
    options.path || "/ui/sidebar/live",
    ...sidebarLiveMiddlewareList(options),
    createSidebarLiveRefreshHandler(options),
  );
  return true;
}

export {
  attachSidebarLiveRoute,
  buildSidebarLiveDescriptor,
  createSidebarLiveRefreshHandler,
  normalizeSidebarLiveItem,
  normalizeSidebarLiveParams,
  normalizeSidebarLivePath,
  normalizeSidebarLiveSide,
  readSidebarLiveItems,
  roomFromSidebarLiveDescriptor,
  sidebarLiveRooms,
};
export type {
  SidebarLiveDescriptor,
  SidebarLiveParams,
  SidebarLiveProtocolOptions,
  SidebarLiveResolveContext,
  SidebarLiveRouteOptions,
};
