import {
  serverObject,
  type ServerRequestLike,
  type ServerResponseLike,
} from "#hf241ii8z71i";

type RenderModeRecord = Record<string, any>;

type RenderModeApi = ((name: string) => any)& {
  config: RenderModeRecord;
  use: (name: string) => any;
  [key: string]: any;
};

type RenderModeSidebarContext = {
  req: ServerRequestLike;
  res: ServerResponseLike;
  side: string;
  sidebar: RenderModeRecord;
};

type RenderModeAppliedContext = {
  cfg: RenderModeRecord;
  modeNames: string[];
  req: ServerRequestLike;
  res: ServerResponseLike;
  ui: RenderModeRecord;
};

type RenderModeOptions = {
  afterApply?: (context: RenderModeAppliedContext) => unknown | Promise<unknown>;
  baseUi: RenderModeRecord | (() => RenderModeRecord);
  clone?: <T>(value: T) => T;
  hydrateSidebar?: (
    context: RenderModeSidebarContext,
  ) => RenderModeRecord | Promise<RenderModeRecord>;
  modes: RenderModeRecord;
};

function cloneRenderModeValue<T>(value: T): T {
  if (value == null) return value;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {}
  }
  return JSON.parse(JSON.stringify(value));
}

function renderModeBaseUi(options: RenderModeOptions) {
  const source =
  typeof options.baseUi === "function" ? options.baseUi() : options.baseUi;
  return (options.clone || cloneRenderModeValue)(source || {});
}

function mergeFrontendUi(baseInput: unknown, overInput: unknown) {
  const base = serverObject(baseInput) as RenderModeRecord;
  const over = serverObject(overInput) as RenderModeRecord;
  const baseSidebars = serverObject(base.sidebars) as RenderModeRecord;
  const overSidebars = serverObject(over.sidebars) as RenderModeRecord;
  return {
    ...base,
    theme: base.theme,
    resources: base.resources,
    PWA: base.PWA,
    subdomain: base.subdomain,
    logo: { ...serverObject(base.logo), ...serverObject(over.logo) },
    page: { ...serverObject(base.page), ...serverObject(over.page) },
    header: { ...serverObject(base.header), ...serverObject(over.header) },
    header_secondary: {
      ...serverObject(base.header_secondary),
      ...serverObject(over.header_secondary),
    },
    footer: { ...serverObject(base.footer), ...serverObject(over.footer) },
    sidebar: { ...serverObject(base.sidebar), ...serverObject(over.sidebar) },
    sidebars: {
      left: {
        ...serverObject(baseSidebars.left || base.sidebar),
        ...serverObject(overSidebars.left),
      },
      right: {
        ...serverObject(baseSidebars.right),
        ...serverObject(overSidebars.right),
      },
    },
    universal: { ...serverObject(base.universal), ...serverObject(over.universal) },
    searchBar: { ...serverObject(base.searchBar), ...serverObject(over.searchBar) },
  };
}

function requirementPasses(spec: any, res: ServerResponseLike) {
  const locals = serverObject(res && res.locals);
  if (!spec) return true;
  const single = spec.requireLocal ? [spec.requireLocal] : [];
  const any = Array.isArray(spec.requireAnyLocal) ? spec.requireAnyLocal : [];
  const requiredKeys = Array.from(new Set([...single, ...any]));
  if (!requiredKeys.length) return true;
  return requiredKeys.some((key) => locals[String(key)] === true);
}

function applyRenderModeConditionalFields(
  mergedBlock: unknown = {},
  modeBlock: unknown = {},
  res: ServerResponseLike,
) {
  const out = { ...serverObject(mergedBlock) };
  const mode = serverObject(modeBlock) as RenderModeRecord;
  for (const fieldName of Object.keys(mode)) {
    const fieldSpec = mode[fieldName];
    if (
      fieldSpec === null ||
        typeof fieldSpec === "string" ||
        typeof fieldSpec === "number" ||
        typeof fieldSpec === "boolean"
    ) {
      out[fieldName] = fieldSpec;
    } else if (fieldSpec && typeof fieldSpec === "object" && "value" in fieldSpec) {
      out[fieldName] = requirementPasses(fieldSpec, res) ? fieldSpec.value : false;
    }
  }
  return out;
}

function applyRenderModeSidebars(
  mergedSidebars: unknown,
  modeSidebars: unknown,
  res: ServerResponseLike,
) {
  const merged = serverObject(mergedSidebars) as RenderModeRecord;
  const mode = serverObject(modeSidebars) as RenderModeRecord;
  return {
    left: applyRenderModeConditionalFields(merged.left, mode.left, res),
    right: applyRenderModeConditionalFields(merged.right, mode.right, res),
  };
}

function normalizeRenderModePath(modeName: unknown) {
  return String(modeName || "")
  .trim()
  .replace(/^\.|\.$/g, "");
}

function resolveRenderModeStack(modeName: unknown, modes: RenderModeRecord) {
  const path = normalizeRenderModePath(modeName);
  if (!path) throw new Error("Unknown render mode: ");
  const parts = path.split(".").map((part) => part.trim()).filter(Boolean);
  const stack: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const key = parts.slice(0, index + 1).join(".");
    const part = parts[index];
    if (modes[key]) stack.push(key);
    else if (index === parts.length - 1 && modes[part]) stack.push(part);
    else if (index === 0) throw new Error(`Unknown render mode: ${path}`);
  }
  if (!stack.length) throw new Error(`Unknown render mode: ${path}`);
  return stack;
}

function mergeRenderModeStack(modeNames: string[], modes: RenderModeRecord) {
  let out: RenderModeRecord = {};
  for (const name of modeNames) out = mergeFrontendUi(out, modes[name]);
  return out;
}

function setRenderModeFlags(
  target: RenderModeRecord,
  modeNames: string[],
  modes: RenderModeRecord,
) {
  const flags: Record<string, boolean> = {};
  for (const key of Object.keys(modes)) flags[key] = false;
  for (const modeName of modeNames) flags[modeName] = true;
  target.renderMode = flags;
}

function ensureRenderModeLocals(res: ServerResponseLike, options: RenderModeOptions) {
  if (!res.locals || typeof res.locals !== "object") res.locals = {};
  if (!res.locals.ui || typeof res.locals.ui !== "object") {
    res.locals.ui = renderModeBaseUi(options);
  }
  if (!res.locals.renderMode || typeof res.locals.renderMode !== "object") {
    res.locals.renderMode = {};
  }
  return res.locals;
}

function normalizeRenderModeSidebar(sidebarInput: unknown): RenderModeRecord {
  const sidebar = serverObject(sidebarInput) as RenderModeRecord;
  const countDisplay = serverObject(sidebar.count_display);
  return {
    ...sidebar,
    count_display: {
      open: String(countDisplay.open || "("),
      close: String(countDisplay.close || ")"),
    },
    entity_counts: serverObject(sidebar.entity_counts),
    data: serverObject(sidebar.data),
  };
}

function applyRenderModeConditionalBlocks(
  merged: RenderModeRecord,
  cfg: RenderModeRecord,
  res: ServerResponseLike,
) {
  for (const key of [
      "header",
      "header_secondary",
      "footer",
      "sidebar",
      "page",
      "universal",
      "searchBar",
  ]) {
    merged[key] = applyRenderModeConditionalFields(merged[key], cfg[key], res);
  }
  merged.sidebars = applyRenderModeSidebars(merged.sidebars, cfg.sidebars, res);
  return merged;
}

async function hydrateRenderModeSidebars(
  req: ServerRequestLike,
  res: ServerResponseLike,
  ui: RenderModeRecord,
  options: RenderModeOptions,
) {
  for (const side of ["left", "right"]) {
    const normalized: RenderModeRecord = normalizeRenderModeSidebar(
      (serverObject(ui.sidebars) as RenderModeRecord)[side],
    );
    ui.sidebars[side] =
    normalized.show === true && options.hydrateSidebar
    ? await options.hydrateSidebar({ req, res, side, sidebar: normalized })
    : normalized;
  }
  ui.sidebar = ui.sidebars.left;
}

async function applyRenderModeUi(
  req: ServerRequestLike,
  res: ServerResponseLike,
  cfg: RenderModeRecord,
  modeNames: string[],
  options: RenderModeOptions,
) {
  const locals = ensureRenderModeLocals(res, options);
  const freshUi = (options.clone || cloneRenderModeValue)(locals.ui);
  const merged = applyRenderModeConditionalBlocks(mergeFrontendUi(freshUi, cfg), cfg, res);
  await hydrateRenderModeSidebars(req, res, merged, options);
  locals.ui = merged;
  await options.afterApply?.({ cfg, modeNames, req, res, ui: merged });
  return locals;
}

function createRenderModeMiddleware(
  modeName: string,
  options: RenderModeOptions,
) {
  const stack = resolveRenderModeStack(modeName, options.modes);
  const cfg = mergeRenderModeStack(stack, options.modes);
  return async function renderModeMiddleware(
    req: ServerRequestLike,
    res: ServerResponseLike,
    next: (error?: unknown) => unknown,
  ) {
    try {
      const state = await applyRenderModeUi(req, res, cfg, stack, options);
      setRenderModeFlags(state, stack, options.modes);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function createRenderModeApi(options: RenderModeOptions): RenderModeApi {
  const api = function renderModeFor(name: string) {
    return createRenderModeMiddleware(name, options);
  } as RenderModeApi;
  api.use = api;
  api.config = options.modes;
  for (const key of Object.keys(options.modes)) {
    Object.defineProperty(api, key, {
        enumerable: true,
        get() {
          return createRenderModeMiddleware(key, options);
        },
    });
  }
  return api;
}

export {
  applyRenderModeConditionalBlocks,
  applyRenderModeConditionalFields,
  applyRenderModeUi,
  cloneRenderModeValue,
  createRenderModeApi,
  createRenderModeMiddleware,
  ensureRenderModeLocals,
  mergeFrontendUi,
  mergeFrontendUi as mergeRenderModeUi,
  mergeRenderModeStack,
  normalizeRenderModePath,
  normalizeRenderModeSidebar,
  resolveRenderModeStack,
  setRenderModeFlags,
};
export type {
  RenderModeApi,
  RenderModeAppliedContext,
  RenderModeOptions,
  RenderModeRecord,
  RenderModeSidebarContext,
};
