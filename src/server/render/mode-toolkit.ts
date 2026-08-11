import {
  serverObject,
  type ServerResponseLike,
} from "#hf241ii8z71i";
import {
  createRenderModeApi,
  mergeFrontendUi,
  type RenderModeApi,
  type RenderModeOptions,
  type RenderModeRecord,
} from "./mode.js";

type FrontendRenderModeToolkit = {
  applyUi: (
    res: ServerResponseLike,
    modeOrOverrides: unknown,
    maybeOverrides?: unknown,
  ) => RenderModeRecord | null;
  makeRenderMode: (modes?: RenderModeRecord) => RenderModeApi;
  mergeUi: typeof mergeFrontendUi;
  renderMode: RenderModeApi;
};

function uiTarget(res: ServerResponseLike | null | undefined) {
  if (!res || !res.locals || typeof res.locals !== "object") return null;
  return serverObject(res.locals.ui);
}

function modePatch(
  modeOrOverrides: unknown,
  maybeOverrides: unknown,
  modes: RenderModeRecord,
) {
  if (typeof modeOrOverrides === "string") {
    const mode = modes[modeOrOverrides];
    if (!mode) throw new Error(`Unknown UI mode: ${modeOrOverrides}`);
    const overrides = serverObject(
      serverObject(maybeOverrides).ui || maybeOverrides,
    );
    return mergeFrontendUi(mode, overrides);
  }
  const object = serverObject(modeOrOverrides);
  return serverObject(object.ui || object);
}

function applyFrontendUi(
  res: ServerResponseLike | null | undefined,
  modeOrOverrides: unknown,
  maybeOverrides: unknown = {},
  modes: RenderModeRecord = {},
) {
  const target = uiTarget(res);
  if (!target) return null;
  const patch = modePatch(modeOrOverrides, maybeOverrides, modes);
  if (!Object.keys(patch).length) return target;
  const next = mergeFrontendUi(target, patch);
  if (res?.locals) res.locals.ui = next;
  return next;
}

function createFrontendRenderModeToolkit(
  options: RenderModeOptions,
): FrontendRenderModeToolkit {
  const makeRenderMode = (modes: RenderModeRecord = options.modes) =>
  createRenderModeApi({ ...options, modes });
  const renderMode = makeRenderMode(options.modes);
  return {
    applyUi: (res, modeOrOverrides, maybeOverrides = {}) =>
    applyFrontendUi(res, modeOrOverrides, maybeOverrides, renderMode.config),
    makeRenderMode,
    mergeUi: mergeFrontendUi,
    renderMode,
  };
}

export {
  applyFrontendUi,
  createFrontendRenderModeToolkit,
};
export type { FrontendRenderModeToolkit };
