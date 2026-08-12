import {
  defaultIconAliases,
  mergeIconAliases,
  normalizeIconAliasMap,
} from "#rqcj8y6keks2";
import { createIconMiddleware } from "#d9gbd4jkefih";
import { text } from "#bu1nq95e3k0f";
import { renderIconHtml } from "./index.js";
import { createIconServerOptions } from "./defaults.js";
import type { IconServerOptions, RenderIconHtmlAttrs } from "./types.js";

type IconServerAttachment = {
  aliases: ReturnType<typeof normalizeIconAliasMap>;
  icon: (spec: unknown, attrs?: RenderIconHtmlAttrs) => string;
  route: string;
};

type AttachIconServerOptions = IconServerOptions& {
  aliases?: unknown;
  iconLocalKey?: string;
  iconsLocalKey?: string;
  includeDefaultAliases?: boolean;
  route?: string | false;
};

type IconServerApp = {
  get?: (path: string, handler: unknown) => unknown;
  locals?: Record<string, unknown>;
  use?: (handler: unknown) => unknown;
};

function iconServerOptions(options: AttachIconServerOptions): IconServerOptions {
  return createIconServerOptions({
      packageRoot: options.packageRoot,
      packageRoots: options.packageRoots,
      packs: options.packs,
      preserveSourceColors: options.preserveSourceColors,
      rootDir: options.rootDir,
  });
}

function normalizeServerIconAliases(
  aliases: unknown,
  includeDefaultAliases = true,
) {
  return includeDefaultAliases
  ? mergeIconAliases(defaultIconAliases, aliases)
  : normalizeIconAliasMap(aliases);
}

function attachIconAliasLocals(
  app: any,
  aliases: unknown,
  localKey = "icons",
  options: { includeDefaultAliases?: boolean } = {},
) {
  const normalizedAliases = normalizeServerIconAliases(
    aliases,
    options.includeDefaultAliases !== false,
  );
  if (!app || typeof app.use !== "function") return normalizedAliases;
  if (app.locals && typeof app.locals === "object") {
    app.locals[localKey] = normalizedAliases;
  }
  attachIconResponseLocal(app, localKey, normalizedAliases);
  return normalizedAliases;
}

function attachIconResponseLocal(app: IconServerApp, localKey: string, value: unknown) {
  app.use?.(function attachIconLocalToResponse(_req: any, res: any, next: any) {
      if (res) {
        if (!res.locals || typeof res.locals !== "object") res.locals = {};
        res.locals[localKey] = value;
      }
      next();
  });
}

function attachIconRendererLocals(
  app: IconServerApp,
  icon: IconServerAttachment["icon"],
  localKey: string,
) {
  if (app.locals && typeof app.locals === "object") app.locals[localKey] = icon;
  if (typeof app.use !== "function") return;
  attachIconResponseLocal(app, localKey, icon);
}

function attachIconServer(
  appInput: unknown,
  options: AttachIconServerOptions = {},
): IconServerAttachment {
  const app = appInput as IconServerApp;
  const serverOptions = iconServerOptions(options);
  const icon = (spec: unknown, attrs: RenderIconHtmlAttrs = {}) =>
  renderIconHtml(spec, attrs, serverOptions);
  const route = options.route === false ? "" : text(options.route) || "/__icons/svg";
  const aliases = attachIconAliasLocals(
    app,
    options.aliases,
    text(options.iconsLocalKey) || "icons",
    { includeDefaultAliases: options.includeDefaultAliases !== false },
  );
  attachIconRendererLocals(app, icon, text(options.iconLocalKey) || "icon");
  if (route && typeof app.get === "function") {
    app.get(route, createIconMiddleware(serverOptions));
  }
  return { aliases, icon, route };
}

export { attachIconAliasLocals, attachIconServer, normalizeServerIconAliases };
export type { AttachIconServerOptions, IconServerAttachment };
