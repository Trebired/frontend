import { serverObject } from "#hf241ii8z71i";

type PermissionStateContext = {
  res?: {
    locals?: Record<string, unknown>;
  };
  shellInput?: {
    permissionState?: Record<string, unknown>;
  };
};

type PermissionStateScope = {
  allOutputKey?: string;
  allToken?: string;
  key: string;
  outputKey?: string;
  viewerPath?: readonly string[];
};

type PermissionStateFlag = {
  allScope?: string;
  key: string;
  permission?: string;
  requireScope?: string;
};

type PermissionStateBuilderOptions = {
  flags?: readonly PermissionStateFlag[];
  requirePermissionLocalKey?: string;
  scopes?: readonly PermissionStateScope[];
  viewerLocalKey?: string;
};

function stringList(input: unknown) {
  return Array.isArray(input)
  ? input.map((item) => String(item == null ? "" : item).trim()).filter(Boolean)
  : [];
}

function pathValue(input: unknown, path: readonly string[] = []) {
  let current = input;
  for (const segment of path) {
    current = serverObject(current)[segment];
  }
  return current;
}

function readLocal(context: PermissionStateContext, key: string) {
  return serverObject(context.res?.locals)[key];
}

function explicitPermissionState(context: PermissionStateContext) {
  const provided = context.shellInput?.permissionState;
  return provided && typeof provided === "object"
  ? provided as Record<string, unknown>
  : null;
}

function readRequirePermission(context: PermissionStateContext, options: PermissionStateBuilderOptions) {
  return serverObject(
    readLocal(context, options.requirePermissionLocalKey || "requirePermission"),
  );
}

function requirePermissionPasses(
  permissions: Record<string, unknown>,
  scope: unknown,
  permission: unknown,
) {
  const fn = permissions[String(scope || "")];
  return typeof fn === "function" && fn(String(permission || "")) === true;
}

function hasPermissionFunctions(permissions: Record<string, unknown>) {
  return Object.keys(permissions).some((key) => typeof permissions[key] === "function");
}

function buildScopeState(
  viewer: unknown,
  scopes: readonly PermissionStateScope[],
  state: Record<string, unknown>,
) {
  const values = new Map<string, string[]>();
  for (const scope of scopes) {
    const list = stringList(pathValue(viewer, scope.viewerPath));
    const outputKey = scope.outputKey || `${scope.key}Permissions`;
    state[outputKey] = list;
    values.set(scope.key, list);
    if (scope.allOutputKey) {
      state[scope.allOutputKey] = list.includes(scope.allToken || "all");
    }
  }
  return values;
}

function applyPermissionFlags(
  state: Record<string, unknown>,
  values: Map<string, string[]>,
  flags: readonly PermissionStateFlag[],
  permissions: Record<string, unknown>,
) {
  for (const flag of flags) {
    const allList = flag.allScope ? values.get(flag.allScope) || [] : [];
    const hasAll = allList.includes("all");
    state[flag.key] = Boolean(
      hasAll ||
        (flag.permission &&
          requirePermissionPasses(
          permissions,
          flag.requireScope || flag.allScope,
          flag.permission,
      )),
    );
  }
}

function buildPermissionState(context: PermissionStateContext, options: PermissionStateBuilderOptions) {
  const explicit = explicitPermissionState(context);
  if (explicit) return explicit;

  const viewer = readLocal(context, options.viewerLocalKey || "viewer");
  const permissions = readRequirePermission(context, options);
  const state: Record<string, unknown> = {};
  const values = buildScopeState(viewer, options.scopes || [], state);

  applyPermissionFlags(state, values, options.flags || [], permissions);
  state.hasRequirePermissionFunctions = hasPermissionFunctions(permissions);
  return state;
}

function createPermissionStateBuilder(options: PermissionStateBuilderOptions = {}) {
  const config = {
    ...options,
    flags: options.flags ? [...options.flags] : [],
    scopes: options.scopes ? [...options.scopes] : [],
  };
  return (context: PermissionStateContext) => buildPermissionState(context, config);
}

export { buildPermissionState, createPermissionStateBuilder };
export type {
  PermissionStateBuilderOptions,
  PermissionStateContext,
  PermissionStateFlag,
  PermissionStateScope,
};
