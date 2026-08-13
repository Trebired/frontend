import {
  resolveLogger,
  type LoggerAdapterLogger,
  type NormalizedLoggerAdapter,
} from "@package/logger-adapter";

type FrontendServerLoggerInput = LoggerAdapterLogger | null | undefined;

const FRONTEND_PACKAGE_SOURCE = "@trebired/frontend";

function resolveFrontendServerLogger(
  logger: FrontendServerLoggerInput,
): NormalizedLoggerAdapter {
  return resolveLogger({
      defaultLogger: false,
      fallback: "noop",
      logger: logger || undefined,
      source: FRONTEND_PACKAGE_SOURCE,
  });
}

export {
  FRONTEND_PACKAGE_SOURCE,
  resolveFrontendServerLogger,
};
export type { FrontendServerLoggerInput };
