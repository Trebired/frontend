import type { ServerResponseLike } from "./http.js";
import {
  attachUseMiddleware,
  responseLocals,
  securityText,
} from "./security/helpers.js";

type SecurityState = {
  csrfToken: string | null;
  nonce: string;
};

type SecurityMiddlewareOptions = {
  csrfLocalKey?: string;
  localsKey?: string;
  nonceLocalKey?: string;
};

function createSecurityState(
  res: ServerResponseLike | null | undefined,
  options: SecurityMiddlewareOptions = {},
): SecurityState {
  const locals = responseLocals(res) || {};
  return {
    csrfToken: securityText(locals[options.csrfLocalKey || "csrfToken"]),
    nonce: securityText(locals[options.nonceLocalKey || "nonce"]) || "",
  };
}

function applySecurityToLocals(
  res: ServerResponseLike | null | undefined,
  options: SecurityMiddlewareOptions = {},
) {
  const locals = responseLocals(res);
  if (!locals) return null;
  const state = createSecurityState(res, options);
  locals[options.localsKey || "security"] = state;
  return state;
}

function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  return function securityMiddleware(
    _req: unknown,
    res: ServerResponseLike,
    next: () => unknown,
  ) {
    applySecurityToLocals(res, options);
    return next();
  };
}

function attachSecurityMiddleware(
  app: unknown,
  options: SecurityMiddlewareOptions = {},
) {
  attachUseMiddleware(app, createSecurityMiddleware(options));
}

export {
  applySecurityToLocals,
  attachSecurityMiddleware,
  createSecurityMiddleware,
  createSecurityState,
};
export type { SecurityMiddlewareOptions, SecurityState };
