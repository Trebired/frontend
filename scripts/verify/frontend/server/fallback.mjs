import assert from "node:assert/strict";
import { serverResponseProbe } from "./probe.mjs";

async function verifyFallbackServer(server) {
  const documentReq = {
    headers: { accept: "text/html,application/xhtml+xml;q=0.9" },
    method: "GET",
  };
  const jsonReq = { headers: { accept: "application/json" }, method: "GET" };
  assert.equal(server.shouldRenderDocumentFallback(documentReq), true);
  assert.equal(server.shouldRenderDocumentFallback(jsonReq), false);
  assert.deepEqual(server.parseAcceptedMediaRange("text/html;q=0.4"), {
      media: "text/html",
      q: 0.4,
  });

  const calls = [];
  await server.respondWithFrontendFallbackMode(
    documentReq,
    serverResponseProbe(),
    (error) => {
      if (error) throw error;
    },
    {
      applyRenderMode: (mode) => (_req, _res, next) => {
        calls.push(`mode:${mode}`);
        return next();
      },
      respond: ({ mode }) => calls.push(`respond:${mode}`),
    },
  );
  await server.respondWithFrontendFallbackMode(
    jsonReq,
    serverResponseProbe(),
    undefined,
    { respond: ({ mode }) => calls.push(`respond:${mode}`) },
  );
  assert.deepEqual(calls, ["mode:error", "respond:document", "respond:json"]);
}

export { verifyFallbackServer };
