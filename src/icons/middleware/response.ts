type ExpressLikeResponse = {
  end?: (body?: string) => unknown;
  send?: (body: string) => unknown;
  set?: (...args: unknown[]) => unknown;
  setHeader?: (name: string, value: string) => void;
  status?: (status: number) => ExpressLikeResponse;
  type?: (type: string) => ExpressLikeResponse;
};

type IconRouteResponse = {
  body: string;
  headers: Record<string, string>;
  status: number;
};

function writeExpressHeader(res: ExpressLikeResponse, name: string, value: string) {
  if (typeof res.setHeader === "function") res.setHeader(name, value);
  else if (typeof res.set === "function") res.set(name, value);
}

function sendExpressResponse(
  res: ExpressLikeResponse,
  response: IconRouteResponse,
): unknown {
  if (typeof res.status === "function") res.status(response.status);
  for (const [name, value] of Object.entries(response.headers)) {
    writeExpressHeader(res, name, value);
  }
  if (typeof res.type === "function" && response.headers["Content-Type"]) {
    res.type(response.headers["Content-Type"]);
  }
  if (typeof res.send === "function") return res.send(response.body);
  return res.end?.(response.body);
}

export { sendExpressResponse };
export type { ExpressLikeResponse, IconRouteResponse };
