# @trebired/frontend

Generic frontend framework for Trebired applications: React shell, design tokens, UI components, browser runtime, and frontend server helpers.

This package owns reusable layout, theme, sidebar, header, overlay, upload, flash, tab, link, icon, and boot-script behavior. Callers own product routes, copy, persistence endpoints, domain rendering, and application design values supplied through config.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/frontend
```

## Quick Start

Configure the package through `.trebired/frontend/config.ts`:

```ts
import { defineConfig } from "@trebired/frontend/config";

export default defineConfig({
  forVersion: "8.0.0",
  assets: {
    icons: {
      endpoint: "/__icons/svg",
      packs: ["remixicon"],
    },
  },
  components: {},
  design: {},
  runtime: {},
  systems: {
    flash: true,
    layout: true,
    popover: true,
    theme: true,
  },
});
```

Bind the browser runtime after the document shell exists:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";

bindFrontendRuntime(document);
```

For a static app without an icon endpoint, generate an icon cache module during the frontend build:

```ts
import { writeStaticIconCacheModule } from "@trebired/frontend/server";

await writeStaticIconCacheModule({
  outFile: "src/frontend/generated/static-icons.ts",
  rootDir: process.cwd(),
  specs: [
    "remixicon:home-line",
    "remixicon:settings-3-line",
  ],
});
```

Register that cache before binding the browser runtime:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";
import { registerFrontendStaticIcons } from "../generated/static-icons";

registerFrontendStaticIcons();
bindFrontendRuntime(document, { icons: { mode: "static" } });
```

## Concepts

### Package Namespace

Frontend source-visible class names, data attributes, CSS variables, tokens, and events are created through `@trebired/bundler` namespace helpers. The package's own `.trebired/bundler/config.ts` declares the `tbf` prefix. Applications do not set a frontend prefix to consume this package.

### Backend-free and Server-backed Surfaces

Backend-free applications can use the config API, generated CSS, namespace helpers, theme and layout runtime, browser binders, static React components, design-token driven primitives, and static icon caches.

Server-backed applications use `@trebired/frontend/server` for package static assets, icon SVG endpoints, React document rendering, server locals, navigation, SEO, theme and language cookies, live socket helpers, and framework middleware.

Runtime components that submit HTTP actions, expect data-attribute request/response endpoints, subscribe to live socket islands, load code-editor assets through server routes, or render server-provided entity graph data require an application backend.

### React Shell

The React entrypoint renders package-owned document, layout, header, sidebar, portal, upload, tabs, tooltip, popover, modal, fullscreen, flash, text-link, language, and theme controls. The markup is generic and configured through `.trebired/frontend/config.ts`.

## Configuration

### Design

`design` config owns palette, semantic tokens, scales, active feedback, shadows, and component styling values. The package stays style-generic and does not hardcode application colors.

### Runtime

`runtime` config owns browser systems such as theme state, navigation hooks, boot scripts, and runtime adapters.

### Icons

`assets.icons.mode` is `"server"` by default. In server mode, browser icon binders fetch SVG from `assets.icons.endpoint`, usually `/__icons/svg`, and an app must attach the icon server helper.

Static apps set `assets.icons.mode: "static"` and `assets.icons.endpoint: false`, then register a build-generated icon cache before calling `bindFrontendRuntime(document, { icons: { mode: "static" } })`.

### Systems

`systems` config enables package-owned binders. Disabled systems do not emit their boot scripts.

## Runtime

Feature binders are idempotent and accept a `Document`, `HTMLElement`, or `DocumentFragment`. Runtime binding syncs newly added DOM without resetting document-level state such as the active theme.

Frontend server helpers own package static assets, icon SVG endpoints, React document rendering support, and frontend middleware that is generic across Trebired applications.

Static icon mode uses `registerStaticIcons()` in the browser. Missing cached icons do not trigger HTTP when the runtime mode is `"static"`.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/config`
- `@trebired/frontend/react`
- `@trebired/frontend/server`

The root entrypoint exports browser runtime binders, namespace helpers, and static icon cache registration. The config entrypoint exports config loading, normalization, generated CSS, and dependency collection. The React entrypoint exports generic UI components. The server entrypoint exports frontend-related backend helpers plus build-time static icon cache helpers.

## Migration Notes

Applications import public APIs only from the package root, `/config`, `/react`, and `/server`. There is no public Sass, style, or internal component subpath API.

## What It Does Not Do

This package does not:

- Own product routes, copy, data, or persistence policy.
- Own application colors outside the supplied frontend config.
- Provide compatibility bridges for removed application-local UI attributes.
- Expose package Sass or internal component subpaths as public API.
- Provide CORS, CSP, security-header, nonce, or HTTP request-log middleware. Use `@trebired/security` for these.
