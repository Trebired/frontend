import assert from "node:assert/strict";

async function verifyFrontendLogging(context) {
  await verifyRuntimeLogger(context);
  await verifyBrowserLogger(context);
}

async function verifyRuntimeLogger(context) {
  const { bindFrontendRuntime } = await context.importDistRoot();
  const events = [];
  const adapter = (_source, event) => events.push(event);
  bindFrontendRuntime(document, {
      adapters: { logger: {}, loggerAdapter: adapter },
      observe: false,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].group, "trebired.frontend.runtime");
  events.length = 0;
  bindFrontendRuntime(document, {
      adapters: { logger: {}, loggerAdapter: adapter },
      frontend_quiet: true,
      observe: false,
  });
  assert.equal(events.length, 0);
}

async function verifyBrowserLogger(context) {
  const { createFrontendBrowserLogger } = await context.importDistRoot();
  const created = [];
  const pushed = [];
  const logger = createFrontendBrowserLogger({
      createLog: (options) => createLogFixture(options, created),
      pushBatch: (batch) => pushed.push(batch),
      readConfig: () => ({
          allowFrontendLogs: true,
          config_key: "cfg-a",
          instanceId: "instance-a",
          requestId: "request-a",
      }),
  });
  assert.equal(Boolean(logger), true);
  assert.equal(created.length, 1);
  assert.equal(created[0].console, false);
  assert.equal(created[0].source, "@trebired/frontend");
  assert.equal(created[0].metadata.instanceId, "instance-a");
  assert.equal(created[0].metadata.requestId, "request-a");
  assert.equal(created[0].metadata.configKey, "cfg-a");
  assert.equal(created[0].transports.includes("console"), false);
  const transport = created[0].transports.find((item) =>
    item && typeof item === "object" && item.name === "logs-view");
  assert.ok(transport);
  transport.write([{ message: "ok" }]);
  assert.equal(pushed.length, 1);
  assert.equal(pushed[0].instanceId, "instance-a");
  assert.equal(pushed[0].entries[0].message, "ok");
}

function createLogFixture(options, created) {
  created.push(options);
  return {};
}

export { verifyFrontendLogging };
