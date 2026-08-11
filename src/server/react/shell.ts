import { toText } from "#ndsvdqv80epr";
import {
  defaultNavigationState,
} from "#73jpqgyg1xf7";
import {
  serverObject,
  type ServerResponseLike,
} from "#hf241ii8z71i";
import type {
  FrontendReactRendererOptions,
  FrontendRenderShell,
} from "#phikqix8e831";

function objectWithFallback(value: unknown, fallback: unknown) {
  const object = serverObject(value);
  return Object.keys(object).length ? object : serverObject(fallback);
}

function readDefaultUi(options: FrontendReactRendererOptions) {
  return typeof options.defaultUi === "function"
  ? options.defaultUi()
  : options.defaultUi || {};
}

function shellPageProps(
  shellInput: FrontendRenderShell | undefined,
  props: Record<string, unknown>,
) {
  return objectWithFallback(shellInput?.pageProps, props);
}

function shellSecurity(
  locals: Record<string, unknown>,
  shellInput: FrontendRenderShell | undefined,
  nonce: string,
) {
  return objectWithFallback(shellInput?.security, {
      csrfToken: locals.csrfToken ?? null,
      nonce,
  });
}

function shellPermissionState(
  res: ServerResponseLike,
  options: FrontendReactRendererOptions,
  shellInput?: FrontendRenderShell,
) {
  return shellInput?.permissionState && typeof shellInput.permissionState === "object"
  ? shellInput.permissionState
  : options.buildPermissionState?.({ res, shellInput }) || {};
}

function buildReactRenderShell(
  res: ServerResponseLike,
  props: Record<string, unknown>,
  options: FrontendReactRendererOptions,
  shellInput?: FrontendRenderShell,
): FrontendRenderShell {
  const locals = serverObject(res?.locals);
  const nonce =
  typeof shellInput?.nonce === "string" ? shellInput.nonce : toText(locals.nonce);
  return {
    dev: objectWithFallback(shellInput?.dev, options.dev || {}),
    lang: typeof shellInput?.lang === "string" ? shellInput.lang : toText(locals.lang, options.defaultLang || "en"),
    locale: objectWithFallback(shellInput?.locale, locals.locale),
    navigation: objectWithFallback(shellInput?.navigation, locals.navigation || defaultNavigationState),
    nonce,
    pageProps: shellPageProps(shellInput, props),
    permissionState: shellPermissionState(res, options, shellInput),
    product: objectWithFallback(shellInput?.product, options.product || {}),
    renderMode: objectWithFallback(shellInput?.renderMode, locals.renderMode),
    requirePermission: objectWithFallback(shellInput?.requirePermission, locals.requirePermission),
    security: shellSecurity(locals, shellInput, nonce),
    seo: objectWithFallback(shellInput?.seo, locals.seo),
    theme: typeof shellInput?.theme === "string" ? shellInput.theme : toText(locals.theme),
    ui: objectWithFallback(shellInput?.ui, locals.ui || readDefaultUi(options)),
    viewer: shellInput?.viewer || (serverObject(locals.viewer) as any) || null,
  };
}

export { buildReactRenderShell, objectWithFallback, readDefaultUi };
