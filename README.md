# @trebired/frontend

Generic browser runtime systems for DOM binding, actions, overlays, theme state, live refresh, inputs, upload, and React rendering in the Trebired ecosystem.

`@trebired/frontend` owns reusable browser behavior. Callers own product routes, product copy, storage keys, icon systems, persistence, navigation, logging, and backend response contracts beyond the documented generic JSON shape.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/frontend
```

## Quick Start

Bind the canonical runtime after your document shell is available:

```ts
import { bindFrontendRuntime } from "@trebired/frontend";

bindFrontendRuntime(document, {
  adapters: {
    navigation: {
      navigate(url) {
        window.location.assign(url);
      },
    },
  },
});
```

Load only the SCSS systems your product uses:

```scss
@use "@trebired/frontend/styles/tokens" as *;
@use "@trebired/frontend/styles/utils" as *;
@use "@trebired/frontend/actions/styles" as *;
@use "@trebired/frontend/flash/styles" as *;
@use "@trebired/frontend/progress/styles" as *;
@use "@trebired/frontend/layer/styles" as *;
@use "@trebired/frontend/tooltip/styles" as *;
@use "@trebired/frontend/popover/styles" as *;
@use "@trebired/frontend/modal/styles" as *;
@use "@trebired/frontend/inputs/styles" as *;
```

Markup stays normal HTML:

```html
<form method="post" action="/api/save" data-tbf-action>
  <input name="title" />
  <button type="submit" data-tbf-confetti="true">Save</button>
</form>

<button type="button" aria-controls="settings" data-tbf-modal-open>
  Settings
</button>
<div id="settings" class="tbf-modal" data-tbf-modal aria-hidden="true">
  <div class="tbf-modal__content" data-tbf-modal-content>
    <button type="button" data-tbf-modal-close>Close</button>
  </div>
</div>
```

## Concepts

### Runtime Ownership

The package exposes feature binders such as `bindActionForms(root)`, `bindTooltips(root)`, `bindModals(root)`, `bindUploads(root)`, and the root `bindFrontendRuntime(root, options)` binder. Binders are idempotent and accept `Document`, `HTMLElement`, or `DocumentFragment` roots.

### Adapter Boundary

Options accept adapters for logger, i18n, navigation, reload, progress, flash, theme persistence, and live skip checks. Defaults stay browser-generic. Runtime logging uses `@trebired/logger-adapter` and emits under `trebired.frontend.*`.

### Data Attributes

The package-owned selectors use `data-tbf-*` attributes. They never require custom elements.

## Configuration

### Runtime Options

`bindFrontendRuntime(root, options)` accepts:

- `adapters.logger`
- `adapters.loggerAdapter`
- `adapters.defaultLogger`
- `adapters.i18n`
- `adapters.navigation`
- `adapters.reload`
- `adapters.progress`
- `adapters.flash`
- `adapters.themePersistence`
- `adapters.live`
- `theme`
- `live`
- `observe`
- `frontend_quiet`
- `quiet`

Set `frontend_quiet: true`, `quiet: true`, `globalThis.frontend_quiet = true`, or `<html data-tbf-frontend-quiet="true">` to disable package runtime logging.

## Runtime

### Binding Order

The canonical runtime binds theme, layer roots, progress, flash, inputs, uploads, tooltips, popovers, modals, actions, and live refresh in that order.

### CSS

There is no aggregate CSS file. Each style-owning system exposes SCSS through package exports so `@trebired/bundler` can resolve package `sass` and `style` conditions from `node_modules`.

Base exports:

- `@trebired/frontend/styles/tokens`
- `@trebired/frontend/styles/utils`

System exports:

- `@trebired/frontend/actions/styles`
- `@trebired/frontend/flash/styles`
- `@trebired/frontend/progress/styles`
- `@trebired/frontend/layer/styles`
- `@trebired/frontend/tooltip/styles`
- `@trebired/frontend/popover/styles`
- `@trebired/frontend/modal/styles`
- `@trebired/frontend/inputs/styles`

## Public API

Entrypoints:

- `@trebired/frontend`
- `@trebired/frontend/dom`
- `@trebired/frontend/http`
- `@trebired/frontend/actions`
- `@trebired/frontend/flash`
- `@trebired/frontend/progress`
- `@trebired/frontend/layer`
- `@trebired/frontend/tooltip`
- `@trebired/frontend/popover`
- `@trebired/frontend/modal`
- `@trebired/frontend/inputs`
- `@trebired/frontend/theme`
- `@trebired/frontend/live`
- `@trebired/frontend/react`
- `@trebired/frontend/styles`
- `@trebired/frontend/styles/tokens`
- `@trebired/frontend/styles/utils`
- `@trebired/frontend/actions/styles`
- `@trebired/frontend/flash/styles`
- `@trebired/frontend/progress/styles`
- `@trebired/frontend/layer/styles`
- `@trebired/frontend/tooltip/styles`
- `@trebired/frontend/popover/styles`
- `@trebired/frontend/modal/styles`
- `@trebired/frontend/inputs/styles`

## What It Does Not Do

This package does not:

- define custom elements
- own product routes, domains, copy, or storage keys
- require a specific icon system
- migrate an existing application to consume the package
- replace framework-specific component libraries
