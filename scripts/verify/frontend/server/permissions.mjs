import assert from "node:assert/strict";

function permissionStateBuilder(server) {
  return server.createPermissionStateBuilder({
      flags: [
        {
          allScope: "root",
          key: "canManageItems",
          permission: "manage:item",
          requireScope: "root",
        },
      ],
      scopes: [
        {
          allOutputKey: "hasRootAll",
          key: "root",
          outputKey: "rootPermissions",
          viewerPath: ["role", "permissions"],
        },
      ],
  });
}

function permissionStateContext() {
  return {
    res: {
      locals: {
        requirePermission: {
          root(permission) {
            return permission === "manage:item";
          },
        },
        viewer: {
          role: {
            permissions: ["read:item"],
          },
        },
      },
    },
  };
}

function verifyPermissionStateServer(server) {
  const build = permissionStateBuilder(server);
  const state = build(permissionStateContext());

  assert.deepEqual(state.rootPermissions, ["read:item"]);
  assert.equal(state.hasRootAll, false);
  assert.equal(state.canManageItems, true);
  assert.equal(state.hasRequirePermissionFunctions, true);
  assert.deepEqual(build({
        shellInput: {
          permissionState: { provided: true },
        },
    }), { provided: true });
}

export { verifyPermissionStateServer };
