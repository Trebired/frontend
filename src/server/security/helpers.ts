import type { ServerResponseLike } from "#hf241ii8z71i";

function securityText(value: unknown) {
  return value == null ? null : String(value);
}

function responseLocals(res: ServerResponseLike | null | undefined) {
  if (!res) return null;
  if (!res.locals || typeof res.locals !== "object") res.locals = {};
  return res.locals;
}

function attachUseMiddleware(app: unknown, middleware: unknown) {
  if (app && typeof (app as { use?: unknown }).use === "function") {
    (app as { use: (handler: unknown) => unknown }).use(middleware);
  }
}

export { attachUseMiddleware, responseLocals, securityText };
