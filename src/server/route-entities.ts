import type { ServerRequestLike, ServerResponseLike } from "./http.js";

type RouteEntityContext = {
  entities: Readonly<Record<string, unknown>>;
  params: Readonly<Record<string, string>>;
  req: ServerRequestLike;
};

type RouteEntityDefinition = {
  name: string;
  read: (id: string, context: RouteEntityContext) => unknown | Promise<unknown>;
};

type RouteEntityNotFound = {
  entity: string;
  next: (error?: unknown) => unknown;
  param: string;
  req: ServerRequestLike;
  res: ServerResponseLike;
  value: string;
};

type RouteEntitiesOptions = {
  entities: Record<string, RouteEntityDefinition>;
  resolveWhen?: (req: ServerRequestLike) => boolean;
  respondNotFound: (context: RouteEntityNotFound) => unknown;
};

type RouteParamHandler = (req: any, res: any, next: (error?: unknown) => unknown, value: unknown) => unknown;

type RouteParamRouter = {
  param: (name: string, handler: RouteParamHandler) => unknown;
};

type RouteEntities = {
  bind: (router: RouteParamRouter) => void;
  read: (res: ServerResponseLike, name: string) => Record<string, any>|null;
};

const ROUTE_ENTITIES_LOCAL = "routeEntities";

function entityLocals(res: ServerResponseLike): Record<string, unknown> {
  const target = res as { locals?: Record<string, unknown> };
  if (!target.locals || typeof target.locals !== "object") target.locals = {};
  const existing = target.locals[ROUTE_ENTITIES_LOCAL];
  if (existing && typeof existing === "object") return existing as Record<string, unknown>;
  const created: Record<string, unknown> = {};
  target.locals[ROUTE_ENTITIES_LOCAL] = created;
  return created;
}

function requestParams(req: ServerRequestLike): Record<string, string> {
  const params = (req as { params?: Record<string, unknown> }).params || {};
  return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value ?? "").trim()]));
}

function isRecord(value: unknown) {
  return Boolean(value) && typeof value === "object";
}

function createParamHandler(options: RouteEntitiesOptions, param: string, definition: RouteEntityDefinition): RouteParamHandler {
  return async function resolveRouteEntity(req, res, next, value) {
    if (options.resolveWhen && options.resolveWhen(req) !== true) return next();
    const id = String(value ?? "").trim();
    const entities = entityLocals(res);
    try {
      const record = id ? await definition.read(id, { entities, params: requestParams(req), req }) : null;
      if (!isRecord(record)) return options.respondNotFound({ entity: definition.name, next, param, req, res, value: id });
      entities[definition.name] = record;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function createRouteEntities(options: RouteEntitiesOptions): RouteEntities {
  const definitions = Object.entries(options.entities || {});
  return {
    bind(router) {
      for (const [param, definition] of definitions) router.param(param, createParamHandler(options, param, definition));
    },
    read(res, name) {
      const record = entityLocals(res)[name];
      return isRecord(record) ? record as Record<string, any> : null;
    },
  };
}

export { createRouteEntities };
export type {
  RouteEntities,
  RouteEntitiesOptions,
  RouteEntityContext,
  RouteEntityDefinition,
  RouteEntityNotFound,
  RouteParamRouter,
};
