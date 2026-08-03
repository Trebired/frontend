# Changelog

All notable changes to `@trebired/frontend` will be documented here.

This project follows semantic versioning once published.

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
