import assert from "node:assert/strict";

const RECORDS = {
  apps: { a1: { id: "a1", org: "o1" } },
  organizations: { o1: { id: "o1" } },
};

function paramRouter() {
  const handlers = new Map();
  return {
    handlers,
    param: (name, handler) => handlers.set(name, handler),
  };
}

async function runParams(router, path, params, viewer = { id: "u1" }) {
  const notFound = [];
  const errors = [];
  const req = { params, viewer };
  const res = { locals: {} };
  for (const name of path) {
    const handler = router.handlers.get(name);
    if (!handler) continue;
    let passed = false;
    await handler(req, res, (error) => {
        if (error) errors.push(error);
        else passed = true;
      }, params[name]);
    if (!passed) return { errors, notFound: res.notFound || notFound, res };
  }
  return { errors, notFound, res };
}

function routeEntities(server, reads = []) {
  return server.createRouteEntities({
      entities: {
        appId: {
          name: "app",
          read: (id, { entities, params }) => {
            reads.push(["app", id, entities.organization?.id]);
            const app = RECORDS.apps[id];
            return app && app.org === params.orgId ? app : null;
          },
        },
        orgId: { name: "organization", read: (id) => RECORDS.organizations[id] || null },
        failId: { name: "fail", read: () => { throw new Error("read failed"); } },
      },
      resolveWhen: (req) => Boolean(req.viewer),
      respondNotFound: ({ entity, param, res, value }) => {
        res.notFound = [entity, param, value];
      },
  });
}

async function verifyRouteEntities(context) {
  const server = await context.importDist("server");
  const reads = [];
  const entities = routeEntities(server, reads);
  const router = paramRouter();
  entities.bind(router);
  assert.deepEqual([...router.handlers.keys()].sort(), ["appId", "failId", "orgId"], "every declared param is bound to the router");

  const found = await runParams(router, ["orgId", "appId"], { appId: "a1", orgId: "o1" });
  assert.deepEqual(found.notFound, [], "existing records pass through");
  assert.deepEqual(entities.read(found.res, "app"), { id: "a1", org: "o1" }, "a resolved record is readable by name");
  assert.deepEqual(reads.at(-1), ["app", "a1", "o1"], "a child read sees the parent entity resolved before it");

  const missingOrg = await runParams(router, ["orgId", "appId"], { appId: "a1", orgId: "nope" });
  assert.deepEqual(missingOrg.notFound, ["organization", "orgId", "nope"], "a missing parent answers not found before its children run");

  const foreignApp = await runParams(router, ["orgId", "appId"], { appId: "a1", orgId: "o2" });
  assert.equal(foreignApp.notFound[0], "organization", "the scope check runs in the app's read");

  const otherScope = await runParams(router, ["appId"], { appId: "a1", orgId: "" });
  assert.deepEqual(otherScope.notFound, ["app", "appId", "a1"], "a record outside its scope answers not found");

  const anonymous = await runParams(router, ["orgId"], { orgId: "nope" }, null);
  assert.deepEqual(anonymous.notFound, [], "signed-out requests pass on to the route's own auth");

  const failing = await runParams(router, ["failId"], { failId: "x" });
  assert.equal(failing.errors[0]?.message, "read failed", "a read that throws goes to the error handler");
  assert.equal(entities.read(failing.res, "fail"), null, "nothing is stored for a failed read");
}

export { verifyRouteEntities };
