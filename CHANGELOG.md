# Changelog

All notable package changes are documented here.

## 6.15.4

- Adopted the external `@trebired/code-discipline-config` preset and updated Code Discipline tooling to `@trebired/code-discipline@^6.0.9`.
- Consolidated repeated frontend runtime helpers for boolean data attributes, close buttons, icon response locals, and React root caching.

## 6.15.3

- Updated the Code Discipline devDependency and lockfile to public `@trebired/code-discipline@^5.5.2`.
## 6.15.2

- Adopted the shared Trebired Code Discipline preset so package configs only keep repo-specific policy.
- Updated the Code Discipline devDependency and lockfile to public `@trebired/code-discipline@^5.5.1`.

## 6.15.1

- Fixed package static route resolution in runtimes that require `import.meta.resolve` to be called on `import.meta`.
- Kept wizard SSR sizing active until a real client measurement is available so early initialization cannot collapse the page before a later load pass corrects it.

## 6.15.0

- Added a configurable server React permission-state builder so apps can keep permission scope policy in config while the package owns render-shell serialization.

## 6.14.1

- Closed stale package modals and popovers before removing portaled overlay nodes during live DOM updates so overlay runtime state stays consistent.

## 6.14.0

- Added package-owned live overlay state helpers for preserving modal scroll, active tabs, portaled popovers, and portaled dropdowns around live DOM updates.

## 6.13.0

- Added package-owned live Socket.IO server helpers for resource rooms, room authorization, broadcasting, and sidebar live sync.
- Added reusable server security policy helpers for nonce middleware, security headers, content security policy, and CORS option delegation.
- Added verification coverage for the new live socket and security policy server APIs.

## 6.12.1

- Added server fallback helpers for HTML document detection, current render-mode path selection, and document-vs-JSON fallback dispatch.
- Reused package-owned sidebar-live route and protocol helpers so apps keep only their live room mapping and data resolvers.

## 6.12.0

- Added adjustable SEO defaults for indexability, robots directives, canonical URLs, social preview tags, verification tags, alternates, and JSON-LD structured data.
- Added package-owned SSR SEO head rendering for product-shell documents.
- Added optional robots.txt and sitemap.xml route helpers.
- Added backend framework helpers for frontend service attachment, sidebar-live routes, and render-mode UI application.

## 6.11.5

- Aligned browser logger transport writer types with logger transport return values.

## 6.11.4

- Preserved the concrete browser logger return type from `createLog` in the browser frontend logger factory.

## 6.11.3

- Added a generic browser frontend logger factory so apps provide only boot-data/config callbacks and the concrete logger creator while the package owns browser error binding and frontend log batch transport.

## 6.11.2

- Added generic product identity helpers for slug-derived frontend names, theme sync channels, theme headers, progress IDs, workflow paths, and repository IDE message types.

## 6.11.1

- Applied default icon aliases and icon server pack defaults when attaching icon server services.
- Allowed `attachFrontendServerServices({ icons: true })` so apps can enable package-owned icon services without local alias plumbing.

## 6.11.0

- Added shared default icon aliases for common ecosystem actions, entities, and status states.
- Added default icon server option builders for Remix Icon, Simple Icons, and Material Icon Theme file icons.
- Added generic entity-key and entity-icon alias helpers so apps keep only their entity registry data.

## 6.10.0

- Added bound theme, language, and sidebar server factories so apps configure frontend server state once and use package-owned helpers from that config.
- Added `attachFrontendServerServices()` for package-owned attachment of frontend security, navigation, locale, SEO, theme, language, sidebar, favicon, icon, Monaco, and static package routes.
- Added generic static directory and package static route helpers for frontend assets such as Monaco without app-owned Express/static wrapper logic.

## 6.9.0

- Added server helpers for attaching current-navigation locals and the full icon server system.
- Added `attachIconServer()` so apps can configure icon aliases, icon HTML locals, and the icon SVG route from package APIs.

## 6.8.0

- Added config-owned icon aliases under `assets.icons.aliases` so apps can define reusable icon names without local duplicate maps.
- Added root icon alias normalization/resolution helpers and a server helper for attaching icon aliases to app/response locals.

## 6.7.1

- Exported `iconSpec` and shared icon normalizers from the browser/root icon API for app-owned icon spec maps.

## 6.7.0

- Added configurable server icon packs so apps can opt into custom SVG packages such as `material-icon-theme`.
- Added Material Icon Theme helpers for resolving file, folder, language, and file-entry icon specs from package metadata.
- Loosened frontend icon config and runtime parsing to normalize custom icon pack specs while keeping server responses limited to configured packs.

## 6.6.1

- Re-exported React server renderer option/context types from `@trebired/frontend/server`.

## 6.6.0

- Added server framework helpers for asset responses, locale locals, page task timeouts, and adapter-based React document rendering.
- Exposed React SSR shell assembly hooks so apps supply product data, permission state, component resolution, and title rules without owning document orchestration.
- Added verification coverage for asset compression/cache behavior, locale middleware, page task fallback results, and React document rendering.

## 6.5.0

- Added public server helpers for frontend security locals and render-mode UI composition.
- Exported shared current-navigation matching helpers from the root package for browser and SSR chrome.
- Added verification coverage for security locals and framework render-mode middleware hooks.

## 6.4.0

- Added public server helpers for UI language cookies, language routes, SSR current-navigation state, and SEO/head middleware.
- Added verification coverage for language selection, active navigation, and SEO response headers.

## 6.3.0

- Added public server helpers for theme cookies, theme toggle handlers, sidebar preference handlers, themed favicon routes, and live-request detection.
- Added theme runtime browser sync options for effective-theme cookies and themed favicon href updates.

## 6.2.1

- Added a generic React fallback title boot script helper for apps using live navigation without owning local document-title boot code.
- Added a namespace event helper so package-generated event names come from the frontend prefix configuration.

## 6.2.0

- Added generic React `ProductShellLayout` and `ProductShellDocument` APIs so apps can pass product-specific render callbacks instead of owning layout/sidebar boot orchestration.
- Added `readProductShellLayoutState()` and `productShellCurrentPath()` for package-owned shell visibility, sidebar side, theme, and current-path state.
- Added package-owned default product-shell sidebar controls for minimize, theme, language, and about actions.

## 6.1.1

- Exported save-policy APIs from the root package entry.
- Added generic React `actionTrigger()` host markup for apps replacing local action-trigger wrappers.
- Loosened action request and decoded payload types for existing typed app callbacks while preserving package-owned event names.

## 6.1.0

- Added public action form/button request APIs, lifecycle events, response-action helpers, and action payload helpers so apps can drop local action runtime wrappers.
- Added package-owned live navigation, rehydration, live card, live region, socket, sidebar sync, scroll-overflow, and live field refresh helpers.
- Added generic save-policy, data, media, file, viewer, socket, and React asset helpers for ecosystem apps.
- Exposed page-load progress boot helpers through the package progress API.

## 6.0.8

- Added generic selector binding helpers, DOM element helpers, paged JSON fetching, and infinite observer utilities to the root frontend API.
- Moved dropdown hidden-input synchronization into the package action form runtime so apps no longer need local form-submit wrappers for package dropdowns.
- Reused the shared DOM helpers in logs/sidebar internals and kept the package free of custom-element registration behavior.

## 6.0.7

- Moved generated font-face CSS before package component styles so configured webfonts are discoverable before the first styled paint.

## 6.0.6

- Added configurable `components.overlays.modal` tokens for modal backdrop, content, and motion styling.
- Added Remixicon close and checkbox icons to upload cropper Cancel and Use image actions while keeping the normal `btn` class.

## 6.0.5

- Changed upload field trigger, clear, and cropper action buttons to use the normal `btn` primitive class instead of upload-specific button classes.
- Removed upload-specific button style tokens so upload customization stays scoped to layout, surface, preview, metadata, list, and cropper styling.

## 6.0.4

- Added structured `components.primitives.upload` tokens for upload fields, upload buttons, previews, drag/selected states, and cropper styling.
- Routed upload and upload cropper SCSS through the new component tokens so apps can customize upload styling from frontend config.

## 6.0.3

- Updated the package Code Discipline config to the platform-aligned rule set, including formatting, redundant path segment cleanup, removable comment checks, structural blank lines, and dry checks.
- Updated the Code Discipline devDependency and lockfile to the current public `@trebired/code-discipline@^5.3.0`.

## 6.0.2

- Routed generated font CSS custom property names through the frontend namespace helper.

## 6.0.1

- Routed file input button styling through `components.primitives.input.file.button` tokens instead of the removed flat file-input token namespace.

## 6.0.0

- Replaced the flat frontend config shape with structured `assets`, `design`, `runtime`, and grouped `components` sections.
- Removed legacy top-level config paths such as `fonts`, `icons`, `palette`, `scales`, `theme`, and `interactions`.
- Reworked component styling tokens into grouped namespaces for primitives, surfaces, overlays, feedback, shell, and data components.
- Moved active press feedback config to `design.interactions.activePress`, still disabled by default with `0.9` as the default brightness when enabled.
- Moved progress runtime tokens to `runtime.progress` and flash tokens to `components.feedback.flash`.

## 5.1.2

- Added `createFrontendTokenHelpers()` for typed frontend config references to palette scale, mode-suffixed palette, semantic variables, CSS variable fallbacks, borders, and color mixes.

## 5.1.1

- Made active press brightness opt-in by default while preserving `0.9` as the default brightness value when enabled.
- Added configurable header brand tag vertical offset tokens for apps that need to tune logo-adjacent tags.

## 5.1.0

- Added package-owned bundler prefix config and generated namespace helpers so the runtime prefix comes from config instead of being an implicit source convention.
- Made theme runtime binding idempotent so mutation-observer rebinding cannot revert a user-selected theme back to SSR/default state.
- Fixed popover hiding to release focused descendants before applying hidden/inert state.
- Added global config-driven active press feedback through `interactions.active`.

## 5.0.11

- Added a configurable `TextLink` primitive backed by `components.textLink` tokens and kept the legacy `text-link` class as the same package-owned style.
- Switched product shell support links to render through `TextLink` without overriding link color or decoration in shell-specific CSS.

## 5.0.10

- Added a combined React boot script component and document alias so apps can emit theme, layout, and sidebar boot scripts from one package API with component-level enable/disable flags.
- Added package-owned header logo/tag markup with horizontal or vertical tag alignment.
- Fixed tooltip arrow border rendering and first-frame tooltip positioning stability.
- Routed remaining source debug logging through the frontend logger adapter with no console fallback, and added verification against direct browser logging.

## 5.0.9

- Changed tooltips to use neutral surface/input tone defaults, added configurable tooltip component tokens, and added arrow styling with smoother placement-aware transitions.

## 5.0.8

- Split popover trigger binding from open state so SSR markup for closed popovers no longer carries an open-state attribute.

## 5.0.7

- Scoped header runtime and sticky selectors to real header elements so body-level SSR layout attributes do not affect hydration measurements.
- Forwarded configured theme mode keys through product shell theme controls so the active theme option is rendered correctly during SSR.

## 5.0.6

- Made product shell theme popovers render with popover data attributes during SSR so they are hidden and styled before client binding.
- Added SSR body/header layout state for primary and secondary headers so initial layout offsets no longer start from zero and then correct after boot.

## 5.0.5

- Made advanced tabs prefer URL route state over an explicit default initial value during SSR.

## 5.0.4

- Added selected-option styling for the product shell theme popover.
- Let layout documents provide the server request URL to advanced tabs so query-string tab state renders correctly in SSR.

## 5.0.3

- Kept product shell theme triggers on the generic button primitive while only applying icon-button sizing to icon-only triggers.

## 5.0.2

- Rendered the product shell theme trigger through the generic button primitive so it matches locale switcher button styling.
- Restored icon-only button icons to the configured button icon color.

## 5.0.1

- Kept icon-only package buttons aligned with the control text color instead of forcing `--tbf-button-icon-color`.

## 5.0.0

- Added `components.progress` tokens so top-level progress styling no longer depends on generic theme token overrides.
- Changed flash titles from `strong` to `span`, added a title font-weight token, and raised the default flash icon size.
- Changed product shell theme controls into popover triggers with theme options instead of one-click toggle buttons.
- Scoped package button active styling to explicit `data-tbf-active="true"` or `aria-pressed="true"` state instead of broad `.active` classes.

## 4.0.5

- Removed pressed state from command-style theme toggle buttons while keeping current theme sync on explicit data attributes.
- Added flash/theme regression coverage to verify flash toasts do not mutate the active document theme.

## 4.0.4

- Preserved component icon classes during runtime icon rebinds so flash status icons keep configured icon colors.

## 4.0.3

- Kept flash stacks on the desktop bottom edge by scoping the mobile bottom-bar safe offset to mobile layout.
- Matched active tab styling to ARIA/data-selected tab markup.
- Applied flash level icon colors to inline SVG icon variables as well as the icon host.

## 4.0.2

- Removed remaining flash type-color fallback variables so semantic flash colors apply only through icon color tokens.

## 4.0.1

- Changed flash defaults to render Remix Icon status glyphs and keep semantic flash coloring scoped to icons only.
- Removed flash type-color fallbacks from titles and countdown progress bars.
- Removed source-level brand string construction from config/logging helpers and split oversized utility/verifier files.

## 4.0.0

- Replaced styled component defaults with neutral structural defaults so app frontend config owns palette and tone values.
- Added flash component token generation and removed package hardcoded palette-family fallbacks from generic UI styling.

## 3.0.0

- Removed the flash close button from runtime and React flash markup.
- Restored flash countdown bars so the default color follows the flash level, with explicit progress-tone overrides still supported.
- Restored compact flash spacing, title coloring, and header support-link rendering closer to the legacy platform styling.
- Renamed the public config helpers to brand-neutral names: `defineFrontendConfig()`, `normalizeFrontendConfig()`, `loadFrontendConfig()`, `findFrontendConfig()`, and `generateFrontendScss()`.
- Added a discipline rule banning hardcoded brand wording outside package metadata.

## 2.0.0

- Added config-driven component tokens for buttons, cards, tabs, action buttons, and surface components so package defaults can match the legacy platform UI without app-side CSS overrides.
- Added flag icons to the package language selector, with locale-region and language-code country resolution plus per-locale overrides.
- Routed package button, card, and advanced tab styles through component tokens while preserving legacy defaults for backgrounds, spacing, borders, radii, and font inheritance.
- Added typed primitive layout/class APIs for buttons, cards, card rows, stacks, inline rows, grids, and text.
