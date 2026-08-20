import {
  attachIconServer,
  type AttachIconServerOptions,
  type IconServerAttachment,
} from "#cqkpmolndi3d";
import {
  attachLanguageMiddleware,
  attachLanguageRoutes,
  type LanguageServerOptions,
  type LanguageSetHandlerOptions,
} from "./language.js";
import {
  attachLocaleMiddleware,
  type LocaleMiddlewareOptions,
} from "./locale.js";
import {
  attachNavigationMiddleware,
  type NavigationMiddlewareOptions,
} from "./navigation.js";
import {
  attachSeoMiddleware,
  type SeoMiddlewareOptions,
} from "./seo.js";
import {
  attachSeoRoutes,
  type SeoRouteOptions,
} from "./seo/routes.js";
import {
  attachSidebarRoutes,
  type SidebarServerOptions,
  type SidebarToggleHandlerOptions,
} from "./sidebar.js";
import {
  attachMonacoStaticRoute,
  attachPackageStaticRoute,
  type PackageStaticRouteOptions,
  type StaticRouteAttachment,
} from "./static.js";
import {
  attachThemeMiddleware,
  attachThemeRoutes,
  type ThemeServerOptions,
  type ThemeToggleHandlerOptions,
} from "./theme.js";
import {
  attachThemedFaviconRoutes,
  type ThemedFaviconOptions,
} from "./favicon.js";

type OptionalService<T> = false | true | T | undefined;

type FrontendThemeServiceOptions =
ThemeToggleHandlerOptions& {
  middleware?: boolean;
  options?: ThemeServerOptions;
  routes?: boolean;
};

type FrontendLanguageServiceOptions =
LanguageSetHandlerOptions& {
  middleware?: boolean;
  options?: LanguageServerOptions;
  routes?: boolean;
};

type FrontendSidebarServiceOptions =
SidebarToggleHandlerOptions& {
  options?: SidebarServerOptions;
  routes?: boolean;
};

type FrontendSeoServiceOptions =
SeoMiddlewareOptions& {
  middleware?: boolean;
  routes?: false | SeoRouteOptions;
};

type FrontendServerServicesOptions = {
  favicon?: false | ThemedFaviconOptions;
  icons?: OptionalService<AttachIconServerOptions>;
  language?: OptionalService<FrontendLanguageServiceOptions>;
  locale?: OptionalService<LocaleMiddlewareOptions>;
  monaco?: OptionalService<Partial<PackageStaticRouteOptions>>;
  navigation?: OptionalService<NavigationMiddlewareOptions>;
  seo?: OptionalService<FrontendSeoServiceOptions>;
  sidebar?: OptionalService<FrontendSidebarServiceOptions>;
  statics?: false | PackageStaticRouteOptions | readonly PackageStaticRouteOptions[];
  theme?: OptionalService<FrontendThemeServiceOptions>;
};

type StaticRoutesInput =
false | PackageStaticRouteOptions | readonly PackageStaticRouteOptions[] | undefined;

type FrontendServerServicesAttachment = {
  favicon?: true;
  icons?: IconServerAttachment;
  language?: true;
  locale?: true;
  monaco?: StaticRouteAttachment;
  navigation?: true;
  seo?: true;
  sidebar?: true;
  statics?: StaticRouteAttachment[];
  theme?: true;
};

function serviceEnabled<T>(service: OptionalService<T>) {
  return service !== false && service != null;
}

function serviceConfig<T>(service: OptionalService<T>): T {
  return (service === true ? {} : service || {}) as T;
}

function attachThemeService(
  app: unknown,
  input: OptionalService<FrontendThemeServiceOptions>,
) {
  if (!serviceEnabled(input)) return false;
  const config = serviceConfig<FrontendThemeServiceOptions>(input);
  if (config.middleware !== false) attachThemeMiddleware(app, config.options || {});
  if (config.routes !== false) attachThemeRoutes(app, config);
  return true;
}

function attachLanguageService(
  app: unknown,
  input: OptionalService<FrontendLanguageServiceOptions>,
) {
  if (!serviceEnabled(input)) return false;
  const config = serviceConfig<FrontendLanguageServiceOptions>(input);
  if (config.middleware !== false) attachLanguageMiddleware(app, config.options || {});
  if (config.routes !== false) attachLanguageRoutes(app, config);
  return true;
}

function attachSidebarService(
  app: unknown,
  input: OptionalService<FrontendSidebarServiceOptions>,
) {
  if (!serviceEnabled(input)) return false;
  const config = serviceConfig<FrontendSidebarServiceOptions>(input);
  if (config.routes !== false) attachSidebarRoutes(app, config);
  return true;
}

function attachSeoService(
  app: unknown,
  input: OptionalService<FrontendSeoServiceOptions>,
) {
  if (!serviceEnabled(input)) return false;
  const config = serviceConfig<FrontendSeoServiceOptions>(input);
  if (config.middleware !== false) attachSeoMiddleware(app, config);
  if (config.routes) attachSeoRoutes(app, config.routes);
  return true;
}

function isStaticRouteArray(
  input: StaticRoutesInput,
): input is readonly PackageStaticRouteOptions[] {
  return Array.isArray(input);
}

function staticRouteList(input: StaticRoutesInput): PackageStaticRouteOptions[] {
  if (input === false || input == null) return [];
  return isStaticRouteArray(input) ? [...input] : [input];
}

function attachFrontendServerServices(
  app: unknown,
  options: FrontendServerServicesOptions = {},
): FrontendServerServicesAttachment {
  const attached: FrontendServerServicesAttachment = {};

  if (serviceEnabled(options.navigation)) {
    attachNavigationMiddleware(app, serviceConfig(options.navigation));
    attached.navigation = true;
  }
  if (serviceEnabled(options.locale)) {
    attachLocaleMiddleware(app, serviceConfig(options.locale));
    attached.locale = true;
  }
  if (attachSeoService(app, options.seo)) attached.seo = true;
  if (attachThemeService(app, options.theme)) attached.theme = true;
  if (attachLanguageService(app, options.language)) attached.language = true;
  if (attachSidebarService(app, options.sidebar)) attached.sidebar = true;
  if (options.favicon) {
    attachThemedFaviconRoutes(app, options.favicon);
    attached.favicon = true;
  }
  if (serviceEnabled(options.icons)) {
    attached.icons = attachIconServer(app, serviceConfig(options.icons));
  }
  if (serviceEnabled(options.monaco)) {
    attached.monaco = attachMonacoStaticRoute(
      app,
      serviceConfig(options.monaco),
    );
  }
  const staticAttachments = staticRouteList(options.statics).map((routeOptions) =>
    attachPackageStaticRoute(app, routeOptions));
  if (staticAttachments.length) attached.statics = staticAttachments;

  return attached;
}

export {
  attachFrontendServerServices,
  attachLanguageService,
  attachSeoService,
  attachSidebarService,
  attachThemeService,
};
export type {
  FrontendLanguageServiceOptions,
  FrontendServerServicesAttachment,
  FrontendServerServicesOptions,
  FrontendSeoServiceOptions,
  FrontendSidebarServiceOptions,
  FrontendThemeServiceOptions,
};
