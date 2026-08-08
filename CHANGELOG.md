# Changelog

All notable changes to `@trebired/frontend` will be documented here.

This project follows semantic versioning once published.

## Unreleased

## 1.13.3

- Added package-owned entity icon helpers so ecosystem apps can remove local entity icon factories while keeping app-specific icon specs.

## 1.13.2

- Added package-owned `.text-link` primitive styling so ecosystem apps can remove local text-link SCSS while keeping the shared class.

## 1.13.1

- Fixed the shell mobile navigation section prop type so JSX content slots are accepted by package consumers.

## 1.13.0

- Added package-owned shell header/mobile navigation composition helpers, support-link rendering, and shell chrome state helpers so ecosystem apps can share header/mobile structure while supplying app-specific slots.

## 1.12.0

- Added package-owned dynamic sidebar link-list rendering and live count/state/loader runtime so ecosystem apps can remove local sidebar DOM/update logic while keeping app-specific item builders and data adapters.

## 1.11.0

- Added package-owned standard action button helpers, copy button runtime, and copy-code cards so ecosystem apps can remove local action wrapper components.
- Added package-owned markdown article, live island mount, searchable entity-list shell, runtime activity/progress helpers, and reusable progress bar controller exports.

## 1.10.0

- Added package-owned generic search panel/item/filter components and the full family-keyed search runtime so ecosystem apps can remove local search primitives.
- Added package-owned shared steps panel, grouped step DOM rendering helpers, and steps controller exports for reusable action progress surfaces.
- Added package-owned wizard markup helpers, runtime binding, and primitive CSS for reusable multi-step flows.

## 1.9.0

- Added package-owned generic explorer file-tree components, normalization helpers, and mount helpers for reusable tree browsing/selecting surfaces.
- Added package-owned readonly editor viewer, content, diff, image-preview, and Monaco panes so ecosystem apps can remove local file viewer primitives.

## 1.8.1

- Accepted the app-supplied `lang` prop on generic editor surface/body props so migrated callers can keep passing locale context.

## 1.8.0

- Added package-owned generic code and Monaco editor primitives with runtime binding, theme-aware syntax highlighting, editable content fields, editor surfaces, and config-selected styles.
- Added reusable content display primitives for app-shaped canvas panels, summary/title-description cards, and data tables through the React entrypoint.

## 1.7.1

- Loosened primitive prop types for app-specific attributes and restored the translated key-value row helper call signature.
- Accepted snake-case `flash_error_only` action UI config alongside the camel-case API.

## 1.7.0

- Added package-owned generic primitive helpers for legacy-shaped button, card body/item/segments/select, form, avatar, pill, separator, list, key/value rows, masonry, loader, status dot, and time counter APIs through the existing root and React entrypoints.
- Added config-selected primitive SCSS and package runtime binding for `data-tbf-time-counter` markup so ecosystem apps can remove local primitive copies without Sass/component subpath imports.

## 1.6.0

- Exposed `createKeyValueInputElement()` through the React entrypoint for package-owned key/value input DOM creation.

## 1.5.0

- Exposed advanced dropdown, checkbox, disclosure, and tabs helper functions through the root entrypoint so ecosystem apps can remove local primitive helper copies without importing package internals.

## 1.4.0

- Added explicit package-owned advanced graph/input exports and runtime binding for the former platform graph, dropdown, disclosure, tabs, checkbox, radio, status, search, toggle, upload, input, and roadmap helpers.

## 1.3.0

- Added package-owned generic header/mobile chrome, breadcrumb, disclosure, tabs, dropdown, search, choice/toggle/status inputs, graph/canvas/roadmap/heatmap surfaces, card/button surfaces, and sidebar link-list/live-slot APIs under the existing root and React entrypoints.

## 1.2.1

- Fixed package layout grid placement so main content stays in the center track when either sidebar is omitted.

## 1.2.0

- Fixed package-owned layout roots so `.tbf-layout` and `[data-tbf-layout-root]` always fill their parent width without app-side utility workarounds.
- Added verification that config-bundled Fontsource assets do not emit duplicated `/assets/assets/` or `/../assets/` URL references.

## 1.1.0

- Moved the remaining generic app CSS surface into package-owned config CSS: base document reset, config-driven Fontsource font-face generation, global tokens, canvas background, spacing/margin helpers, wrapping row helpers, vertical alignment helpers, and generated spacing utilities.
- Expanded the package flash system with confirmation variant helpers, text confirmation models, progress tones, live/sticky convenience methods, `showFlashMessage()`, and `window.flash` installation so ecosystem apps can consume flash directly from `@trebired/frontend`.

## 1.0.0

- Consolidated the public package API to structured entrypoints only: `@trebired/frontend`, `@trebired/frontend/config`, `@trebired/frontend/react`, and `@trebired/frontend/server`. Public Sass/component subpath exports are no longer part of the app contract.
- Added config-driven palette and scale CSS generation so ecosystem apps declare theme values in `.trebired/frontend/config.ts` and `@trebired/bundler` compiles package CSS in memory.
- Added package-owned generic utility CSS coverage for layout, spacing, sizing, text, border, alignment, and scroll helpers through the config-selected package CSS path.
- Added the package-owned sidebar system with runtime binding, persisted minimize state, mobile open/close state, React markup components, boot script, and internal CSS.
- Added the package-owned layout system with stable document/layout/main/content/header/bottom-bar/portal markup components, body-state boot script, runtime body-state syncing, and internal CSS so Trebired ecosystem apps share the same HTML structure.
- Expanded fullscreen into a package-owned panel fullscreen system with registered targets, open/close/toggle controls, overlay/placeholder restoration, persisted target ids, React components, and internal CSS while keeping native browser fullscreen helpers.
- Added the `@trebired/frontend/server` entrypoint for server-side icon helpers and middleware, and moved React component consumption behind `@trebired/frontend/react`.
- Updated verification to enforce structured exports, absence of public Sass/component subpaths, config-bundled package CSS, and package-owned layout/sidebar/fullscreen behavior.

## 0.5.0

- Generalized the `./theme` runtime to an open, caller-supplied registry of named modes: `configureThemeModes()`, `getThemeModes()`, `themeModeKeys()`, `findThemeMode()`, `isThemeMode()`, mode-aware `setTheme()`/`normalizeTheme()`/`systemThemeKey()`, and `nextTheme()` as a cycler over the registry. `ThemeValue` is now `string`; `data-tbf-theme` accepts any registered key and `color-scheme` follows each mode's declared scheme.
- Added `[data-tbf-theme-select]` control binding (`bindThemeControls()`, `bindThemeSelect()`, `bindThemeSelects()`, `syncThemeControls()`, `syncThemeSelect()`, `syncThemeSelects()`) for `<select>` pickers and `[data-tbf-theme-value]` option groups.
- Added the `<ThemeSelect>` multi-choice component with `select` and `buttons` variants, a `labels` prop on `<ThemeToggle>`, and mode registry props on `<ThemeBootScript>`, whose boot script now publishes the registry for the client runtime.
- Added `theme.modes`, `theme.defaultMode`, `theme.dark`, and `theme.light` to `.trebired/frontend/config.ts`. `generateTrebiredFrontendScss()` emits one `[data-tbf-theme="<mode>"] {}` block per declared mode plus `prefers-color-scheme` fallbacks, alongside the existing shared `:root {}` block.
- Added `dependencies` to the `loadTrebiredFrontendConfig()` result and keyed the config compile cache on the whole relative import graph, so a design-tokens module imported by the config file drives generated CSS without stale output.
- Added `collectConfigDependencies()` and `THEME_MODE_ATTRIBUTE` to `@trebired/frontend/config`.

## 0.4.2

- Removed the project-local `.trebired/frontend/generated/styles.scss` writer contract; frontend config now exposes deterministic SCSS for bundlers to consume in memory.

## 0.4.1

- Refreshed package dependency ranges and lockfile state with `bun update` after adopting the `.trebired/code-discipline` structure.

## 0.4.0

- Added `.trebired/frontend/config.ts` support with `defineTrebiredFrontendConfig()`, validation, defaults, deterministic generated SCSS, and `.trebired/frontend/generated/styles.scss` output.
- Added first-class `remixicon` and `simple-icons` support with spec parsing, server HTML rendering, SVG response helpers, Express-compatible middleware, browser fetch/cache rendering, React `Icon`, simple-icons brand colors, explicit colors, source-color preservation, and shared icon SCSS.
- Added the fullscreen runtime and upgraded root runtime binding to include icons and fullscreen controls.
- Improved generic modal/layer behavior with focus restoration, scroll-lock gap handling, lifecycle events, fullscreen-aware layers, and safer dialog timer cleanup for flash prompts/confirms.
- Added config/icon/runtime verification and updated package exports, README examples, and pack coverage.

## 0.3.0

- Added TSX markup component subpaths for actions, flash, progress, layers, tooltips, popovers, modals, inputs, theme, and live refresh.
- Added full generic upload markup and runtime support for directory picking, mixed picking, multiple files, drag/drop, accepted-format validation, previews, empty toggles, current-preview clearing, crop config, crop hidden fields, and manager helpers.
- Added upload crop sessions with cropper loading isolated to the crop path.
- Changed default SCSS to square, neutral fallbacks with per-system styling only.
- Added verification for component imports, rendered upload slots, root import isolation, product-name leaks, custom element tags, radius fallbacks, and absence of `wrap` classes in upload output.
- Added the package publish workflow for tag-based and manual npm publishing.

## 0.2.0

- Replaced the aggregate CSS export with per-system SCSS package exports for tokens, utilities, actions, flash, progress, layers, tooltips, popovers, modals, and inputs.
- Added logger-adapter-backed frontend runtime logging with `frontend_quiet` support.
- Added verification for SCSS package import resolution, quiet runtime logging, and absence of the old `styles.css` export.

## 0.1.1

- Completed the reusable frontend runtime package surface with Code Discipline `imports` enforcement and dead import removal enabled.
- Kept the package generic browser-owned runtime only, with normal HTML data-attribute bindings and no custom elements.

## 0.1.0

- Added generic browser runtime exports for DOM helpers, CSRF fetch, actions, flash, progress, overlays, theme state, live refresh, inputs, upload, React rendering, and styles.
- Added package verification for packed exports and executable browser behavior.
