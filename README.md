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

## Concepts

### Package Namespace

Frontend source-visible class names, data attributes, CSS variables, tokens, and events are created through `@trebired/bundler` namespace helpers. The package's own `.trebired/bundler/config.ts` declares the `tbf` prefix. Applications do not set a frontend prefix to consume this package.

### React Shell

The React entrypoint renders package-owned document, layout, header, sidebar, portal, upload, tabs, tooltip, popover, modal, fullscreen, flash, text-link, language, and theme controls. The markup is generic and configured through `.trebired/frontend/config.ts`.

## Configuration

### Design

`design` config owns palette, semantic tokens, scales, active feedback, shadows, and component styling values. The package stays style-generic and does not hardcode application colors.

### Runtime

`runtime` config owns browser systems such as theme state, navigation hooks, boot scripts, and runtime adapters.

### Systems

`systems` config enables package-owned binders. Disabled systems do not emit their boot scripts.

## Runtime

Feature binders are idempotent and accept a `Document`, `HTMLElement`, or `DocumentFragment`. Runtime binding syncs newly added DOM without resetting document-level state such as the active theme.

Frontend server helpers own package static assets, icon SVG endpoints, React document rendering support, and frontend middleware that is generic across Trebired applications.

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/config`
- `@trebired/frontend/react`
- `@trebired/frontend/server`

The root entrypoint exports browser runtime binders and namespace helpers. The config entrypoint exports config loading, normalization, generated CSS, and dependency collection. The React entrypoint exports generic UI components. The server entrypoint exports frontend-related backend helpers.

## Migration Notes

Applications import public APIs only from the package root, `/config`, `/react`, and `/server`. There is no public Sass, style, or internal component subpath API.

## What It Does Not Do

This package does not:

- Own product routes, copy, data, or persistence policy.
- Own application colors outside the supplied frontend config.
- Provide compatibility bridges for removed application-local UI attributes.
- Expose package Sass or internal component subpaths as public API.
