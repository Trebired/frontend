import {
  attachFrontendServerServices,
  type FrontendServerServicesAttachment,
  type FrontendServerServicesOptions,
} from "./services.js";
import {
  attachSidebarLiveRoute,
  type SidebarLiveRouteOptions,
} from "./sidebar-live.js";

type FrontendFrameworkOptions = FrontendServerServicesOptions& {
  sidebarLive?: false | SidebarLiveRouteOptions;
};

type FrontendFrameworkAttachment = {
  services: FrontendServerServicesAttachment;
  sidebarLive: boolean;
};

type FrontendFramework = {
  attach: (app: unknown) => FrontendFrameworkAttachment;
  options: FrontendFrameworkOptions;
};

function attachFrontendFramework(
  app: unknown,
  options: FrontendFrameworkOptions = {},
): FrontendFrameworkAttachment {
  const services = attachFrontendServerServices(app, options);
  const sidebarLive =
  options.sidebarLive === false || options.sidebarLive == null
  ? false
  : attachSidebarLiveRoute(app, options.sidebarLive);
  return { services, sidebarLive };
}

function createFrontendFramework(
  options: FrontendFrameworkOptions = {},
): FrontendFramework {
  return {
    attach: (app) => attachFrontendFramework(app, options),
    options,
  };
}

export {
  attachFrontendFramework,
  createFrontendFramework,
};
export type {
  FrontendFramework,
  FrontendFrameworkAttachment,
  FrontendFrameworkOptions,
};
