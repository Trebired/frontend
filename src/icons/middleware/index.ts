import { normalizeSpace } from "#bu1nq95e3k0f";
import { createIconSvgResponse } from "#wwj1o2wv6dor";
import type { IconServerOptions } from "#wwj1o2wv6dor";

type ExpressLikeRequest = {
  query?: Record<string, unknown>;
  url?: string;
};

type ExpressLikeResponse = {
  setHeader?: (name: string, value: string) => void;
  set?: (headers: Record<string, string>) => unknown;
  status?: (status: number) => ExpressLikeResponse;
  type?: (type: string) => ExpressLikeResponse;
  send?: (body: string) => unknown;
  end?: (body?: string) => unknown;
};

type ExpressNext = (error?: unknown) => void;

function readRequestSpec(req: ExpressLikeRequest): string {
  const querySpec = normalizeSpace(req?.query?.spec);
  if (querySpec) return querySpec;
  try {
    const url = new URL(req.url || "", "http://localhost");
    return normalizeSpace(url.searchParams.get("spec"));
  } catch {
    return "";
  }
}

function sendExpressResponse(res: ExpressLikeResponse, response: ReturnType<typeof createIconSvgResponse>): unknown {
  if (typeof res.status === "function") res.status(response.status);
  if (typeof res.set === "function") res.set(response.headers);
  else {
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader?.(key, value);
    }
  }
  if (typeof res.type === "function" && response.headers["Content-Type"]) {
    res.type(response.headers["Content-Type"]);
  }
  if (typeof res.send === "function") return res.send(response.body);
  return res.end?.(response.body);
}

function createIconMiddleware(options: IconServerOptions = {}) {
  return function iconMiddleware(req: ExpressLikeRequest, res: ExpressLikeResponse, next?: ExpressNext): unknown {
    try {
      return sendExpressResponse(res, createIconSvgResponse(readRequestSpec(req), options));
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  };
}

const createExpressIconMiddleware = createIconMiddleware;

export { createExpressIconMiddleware, createIconMiddleware };
export type { ExpressLikeRequest, ExpressLikeResponse };
