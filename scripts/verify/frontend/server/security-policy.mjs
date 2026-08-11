import assert from "node:assert/strict";

import { appCapture, serverResponseProbe } from "./probe.mjs";

function verifyNonceMiddleware(server) {
  const nonceApp = appCapture();
  server.attachNonceMiddleware(nonceApp, { bytes: 8 });
  const nonceRes = serverResponseProbe();
  nonceApp.middlewares[0]({}, nonceRes, () => {});
  assert.equal(typeof nonceRes.locals.nonce, "string");
  assert.ok(nonceRes.locals.nonce.length > 0);
}

function verifySecurityHeaders(server) {
  const headerRes = serverResponseProbe();
  server.applySecurityHeaders(
    { secure: true },
    headerRes,
    { acceptClientHints: ["Sec-CH-Prefers-Color-Scheme"] },
  );
  assert.equal(
    headerRes.headers["Strict-Transport-Security"],
    "max-age=31536000; includeSubDomains; preload",
  );
  assert.equal(headerRes.headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headerRes.headers["Accept-CH"], "Sec-CH-Prefers-Color-Scheme");
}

function verifyContentSecurityPolicy(server) {
  const cspRes = serverResponseProbe();
  cspRes.locals = { nonce: "nonce-a" };
  server.applyContentSecurityPolicy(
    { secure: true },
    cspRes,
    {
      directives: ({ nonce }) => [`script-src 'nonce-${nonce}'`],
      shouldUpgradeInsecureRequests: () => true,
    },
  );
  assert.equal(
    cspRes.headers["Content-Security-Policy"],
    "script-src 'nonce-nonce-a'; upgrade-insecure-requests",
  );
}

function corsResult(delegate, origin) {
  return new Promise((resolve, reject) => {
      delegate({ headers: { origin } }, (error, options) => {
          if (error && origin === "https://example.test") reject(error);
          else resolve({ error, options });
      });
  });
}

async function verifyCorsDelegate(server) {
  const delegate = server.createCorsOptionsDelegate({
      isAllowedOrigin: (_req, origin) => origin === "https://example.test",
  });
  const allowed = await corsResult(delegate, "https://example.test");
  assert.equal(allowed.error, null);
  assert.equal(allowed.options.origin, true);
  const denied = await corsResult(delegate, "https://blocked.test");
  assert.equal(denied.error.message, "Not allowed by CORS");
  assert.deepEqual(denied.options, { origin: false });
}

async function verifySecurityPolicyServer(server) {
  verifyNonceMiddleware(server);
  verifySecurityHeaders(server);
  verifyContentSecurityPolicy(server);
  await verifyCorsDelegate(server);
}

export { verifySecurityPolicyServer };
