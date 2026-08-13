import { withIconServerRenderer } from "#6o6fqz7svsts";
import {
  applyScriptNonce,
  buildDocumentContext,
  defaultNormalizePageId,
  logDocumentStart,
  rootDocumentProps,
} from "#kglbvvg0e45p";
import {
  buildReactRenderShell,
} from "#hrmhyqyjhxa3";
import { resolveFrontendServerLogger } from "#jug9z8qra4yv";
import type {
  FrontendReactRendererOptions,
  FrontendRenderShell,
  RenderReactPageOptions,
} from "#phikqix8e831";
import type { ServerResponseLike } from "#hf241ii8z71i";

function renderWithIcons(
  render: () => string,
  iconRenderer?: ((spec: string) => unknown) | undefined,
) {
  return withIconServerRenderer(iconRenderer as any, render);
}

function timedRender(render: () => string, options: FrontendReactRendererOptions) {
  const startedAt = performance.now();
  try {
    return render();
  } finally {
    options.recordRender?.(Math.max(0, performance.now() - startedAt));
  }
}

function logReactRenderInfo(
  options: FrontendReactRendererOptions,
  message: string,
  metadata: Record<string, unknown>,
) {
  if (options.logger) {
    resolveFrontendServerLogger(options.logger).info(
      "react.render",
      message,
      metadata,
    );
    return;
  }

  options.log?.info?.(message, metadata);
}

function timedResolve<T>(
  resolve: () => T,
  onResolved: (durationMs: number) => void,
): T {
  const startedAt = performance.now();
  try {
    return resolve();
  } finally {
    onResolved(Math.max(0, performance.now() - startedAt));
  }
}

function resolvePageComponent(
  componentId: string,
  options: FrontendReactRendererOptions,
) {
  return timedResolve(
    () => options.resolvePageComponent(componentId),
    (durationMs) =>
    logReactRenderInfo(options, "resolved react page component", {
        component_id: componentId,
        duration_ms: durationMs,
    }),
  );
}

function resolveRootDocument(options: FrontendReactRendererOptions) {
  return timedResolve(
    () => options.resolveRootDocument(),
    (durationMs) =>
    logReactRenderInfo(options, "resolved react root document", {
        duration_ms: durationMs,
    }),
  );
}

function renderBody(
  componentId: string,
  props: Record<string, unknown>,
  options: FrontendReactRendererOptions,
) {
  return options.createElement(resolvePageComponent(componentId, options), props);
}

function renderFragment(
  component: any,
  props: Record<string, unknown>,
  options: FrontendReactRendererOptions,
) {
  if (!options.renderToStaticMarkup) {
    throw new Error("React static markup renderer is not configured.");
  }
  return timedRender(
    () => renderWithIcons(
      () => options.renderToStaticMarkup!(options.createElement(component, props)),
      options.createIconRenderer?.(),
    ),
    options,
  );
}

function withAutoPageLang(
  res: ServerResponseLike,
  propsInput: Record<string, unknown>,
) {
  const props =
  propsInput && typeof propsInput === "object" ? propsInput : {};
  if ("lang"in props) return props;
  const lang = res?.locals && typeof res.locals === "object" ? res.locals.lang : undefined;
  return lang ? { ...props, lang } : props;
}

function sendDocument(
  res: ServerResponseLike,
  pageId: string,
  body: unknown,
  componentId: string,
  props: Record<string, unknown>,
  options: FrontendReactRendererOptions,
  shellInput?: FrontendRenderShell,
) {
  const context = buildDocumentContext(res, pageId, componentId, props, options, shellInput);
  const root = resolveRootDocument(options);
  logDocumentStart(context, res, options);
  const html = timedRender(
    () => renderWithIcons(
      () => options.renderToString(
        options.createElement(root, rootDocumentProps(body, context, options)),
      ),
      options.createIconRenderer?.(),
    ),
    options,
  );
  if (typeof(res as any).type === "function")(res as any).type("html");
  return res.send?.(`<!DOCTYPE html>${applyScriptNonce(html, context.shell.nonce)}`);
}

function renderPage(
  res: ServerResponseLike,
  pageId: string,
  propsInput: Record<string, unknown>,
  options: FrontendReactRendererOptions,
  renderOptions: RenderReactPageOptions = {},
) {
  const normalizePageId = options.normalizePageId || defaultNormalizePageId;
  const normalizedPageId = normalizePageId(pageId);
  const componentId = normalizePageId(renderOptions.componentId || normalizedPageId);
  const props = withAutoPageLang(res, propsInput);
  if (!res.locals || typeof res.locals !== "object") res.locals = {};
  res.locals.reactPageProps = props;
  return sendDocument(
    res,
    normalizedPageId,
    renderBody(componentId, props, options),
    componentId,
    props,
    options,
    renderOptions.shell,
  );
}

function createFrontendReactRenderer(options: FrontendReactRendererOptions) {
  return {
    buildShell: buildReactRenderShell,
    renderFragment: (component: any, props: Record<string, unknown>) =>
    renderFragment(component, props, options),
    renderPage: (
      res: ServerResponseLike,
      pageId: string,
      props: Record<string, unknown>,
      renderOptions: RenderReactPageOptions = {},
    ) => renderPage(res, pageId, props, options, renderOptions),
    sendDocument: (
      res: ServerResponseLike,
      pageId: string,
      body: unknown,
      componentId: string,
      props: Record<string, unknown>,
      shellInput?: FrontendRenderShell,
    ) => sendDocument(res, pageId, body, componentId, props, options, shellInput),
  };
}

export {
  buildReactRenderShell,
  createFrontendReactRenderer,
  defaultNormalizePageId,
  renderPage as renderFrontendReactPage,
  sendDocument as sendFrontendReactDocument,
};
export type {
  FrontendAssetLinkSet,
  FrontendDocumentContext,
  FrontendReactRendererOptions,
  FrontendRenderShell,
  RenderReactPageOptions,
} from "#phikqix8e831";
