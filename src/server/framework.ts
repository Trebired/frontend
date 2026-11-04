import {
  attachFrontendServerServices,
  type FrontendServerServicesAttachment,
  type FrontendServerServicesOptions,
} from "./services.js";

type FrontendFrameworkOptions = FrontendServerServicesOptions;

type FrontendFrameworkAttachment = {
  services: FrontendServerServicesAttachment;
};

type FrontendFramework = {
  attach: (app: unknown) => FrontendFrameworkAttachment;
  options: FrontendFrameworkOptions;
};

function attachFrontendFramework(
  app: unknown,
  options: FrontendFrameworkOptions = {},
): FrontendFrameworkAttachment {
  return { services: attachFrontendServerServices(app, options) };
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
