# Changelog

All notable changes to `@trebired/frontend` will be documented here.

This project follows semantic versioning once published.

## 9.0.0

### Breaking

- Heading base styles no longer use `!important`. `styles/utils/base.scss` set `margin`, `font-weight`, and `font-size` on `h1`-`h6` with `!important`, so no application stylesheet could override them at any specificity — every heading on a consuming site was clamped to the reset's sizes. The declarations are unchanged in value but now lose to ordinary application CSS, so headings an app already styled will render at the app's sizes after upgrading.
- Removed the exported `LiveSocketLogger` type from `@trebired/frontend/server`. `LiveSocketServerOptions.logger` is now typed `FrontendServerLoggerInput`, which accepts any logger-adapter logger, so existing call sites are unaffected.

### Fixed

- Heading font sizes are tokenized. `h1`-`h6` now read `--<prefix>-h1-font-size` through `--<prefix>-h6-font-size`, with the previous literals as fallbacks, so they can be set from `defineConfig` via `design.semantics.h1.fontSize`. The `max-width: 640px` overrides read `--<prefix>-h{n}-font-size-mobile` and fall back to the desktop token, so setting only the desktop token applies at every width.
- `design.semantics` keys are now kebab-cased like component tokens. `tokenDeclarations()` emitted flattened keys verbatim while `componentTokenDeclarations()` ran them through `componentTokenCssName()`, so `semantics.heading.fontWeight` produced `--<prefix>-heading-fontWeight` and silently did nothing. It now produces `--<prefix>-heading-font-weight`. Keys already written in kebab-case are unaffected.
- `createLiveSocketServer()` now stamps its own log source. The `live namespace attached` record reports `origin.source` as `@trebired/frontend` instead of inheriting the consuming app's logger identity. `server/live-socket.ts` was the only server module that called the caller-supplied logger object directly rather than routing through `resolveFrontendServerLogger()`, so its records were attributed to whichever app passed the logger in. The `logger` option is the log sink only and can no longer change how this package's own records are attributed.

## 8.6.3

- Added package-owned SPA live page lifecycle events and APIs, including navigation/page IDs, old-page disposal before DOM replacement, and page-scoped cleanup for logs, live cards/lists, dynamic sidebar subscriptions, and React live islands.
- Added the `@trebired/frontend/live` export for direct lifecycle consumption.

## 8.6.2

- Updated logger-adapter and package tooling dependency ranges to the current Trebired releases so consumers do not retain stale nested logger packages.

## 8.6.1

- Updated the logger-adapter dependency so frontend logging uses the current shared adapter release.

## 8.6.0

- Added static icon cache registration so browser and React icon rendering can work without a live icon SVG endpoint.
- Added build-time static icon cache helpers from `@trebired/frontend/server`, including `buildStaticIconCache()` and `writeStaticIconCacheModule()`.
- Added `assets.icons.mode` with static mode support and documented which package surfaces work without a backend and which require backend services.

## 8.5.0

- Removed `server/security.ts`, `server/security/cors.ts`, `server/security/policy.ts`, `server/security/helpers.ts`, and `server/request-log.ts` along with their exports (`SecurityState`, `createSecurityState`, `applySecurityToLocals`, `attachSecurityMiddleware`, `createSecurityMiddleware`, `createCorsOptionsDelegate`, `defaultCorsOptions`, `attachNonceMiddleware`, `attachSecurityHeadersMiddleware`, `attachContentSecurityPolicyMiddleware`, `attachFrontendRequestLogger`). This package no longer carries CORS, CSP, security-header, nonce, or HTTP request-logging middleware — that generic Express/Node security layer now lives in `@trebired/security`, which product apps should depend on directly. `attachFrontendServerServices`'s optional `security` service is removed along with it (it only ever wired the now-deleted `attachSecurityMiddleware`).
- `server/http.ts` is now a thin re-export of `@trebired/utils`'s `redirectResponse`, `requestBody`, `requestCookies`, `requestHeader`, `requestQuery`, `responseSecure`, `sendJson`, `sendText`, `serverObject`, `serverString`, `setResponseHeader`, and the `CookieOptions`/`HeaderMap`/`ServerRequestLike`/`ServerResponseLike` types, which moved there so `@trebired/security` and this package can share one framework-agnostic req/res layer without a `@trebired/security` → `@trebired/frontend` dependency. Existing imports from `@trebired/frontend/server` are unaffected.
- Bumped the `@trebired/utils` dependency to `^0.8.0`.

## 8.4.3

- Increased the disclosure card's padding from `--tbf-gap-xs` to `--tbf-gap-sm`. In apps whose theme collapses `gap-xs`/`gap-xs2` down to the same very small value, `padding: var(--tbf-gap-xs)` rendered close enough to 0 that the card read as having no padding at all.
- Restored the sidebar's block-start padding (previously zeroed out), now exposed as `--tbf-sidebar-padding-block-start` (default `20px`) alongside the existing `--tbf-sidebar-padding-block-end`.

## 8.4.2

- Removed the disclosure trigger's hover color/underline on its label text, leaving the cursor as the only hover affordance now that the trigger has no box chrome of its own.
- Made the disclosure's arrow indicator bigger (`1.35em`) and muted (`--tbf-text-muted`) instead of matching the trigger's own text size/color.
- Fixed page content shifting horizontally when a modal opens or closes. The modal locked body scroll by toggling `overflow: hidden` and manually measuring/compensating for the scrollbar's width with `padding-right`, but `closeModal` reverted that compensation synchronously (before the 220ms close transition finished), so the scrollbar reappeared and the page visibly jumped left mid-animation. `html` now reserves `scrollbar-gutter: stable` unconditionally, so the scrollbar's width never changes the content width in the first place; the modal's manual scrollbar-width measurement and compensating `padding-right` are removed as no longer necessary.

## 8.4.1

- Fixed the sidebar rendering with a gap below the header on pages with a secondary header. The sidebar's top offset was wired to `--tbf-layout-top-offset`, which includes the secondary header's height, but the secondary header only renders inside the main content column (never full-width above the sidebar), so that extra height showed up as a dead gap. The sidebar now offsets by `--tbf-header-height` alone.
- Redesigned the disclosure's spacing and trigger: the card now uses a single uniform `--tbf-gap-xs` padding on all sides (replacing the previous asymmetric per-element padding), and `--tbf-gap-sm` now separates the trigger from the panel content. The trigger itself no longer has its own padding or a full-row hover background — only its label text responds to hover — so it reads as plain clickable text rather than a nested button/chip.
- Moved the disclosure's arrow indicator to the end of the trigger row (`margin-inline-start: auto`) and made it rotate 90° when open, so it now reflects the disclosure's state instead of being a static glyph.
- Fixed the disclosure panel losing its grid-based collapse when a consumer passed a `panelClassName` that set `align-items` (e.g. `inline-row`, used to lay out the 2FA manual-key/copy-button row) — the panel's own `align-items: stretch` is now asserted explicitly, since otherwise the panel content stopped stretching into the collapsed 0-height row and rendered at its natural height regardless of open/closed state.

## 8.4.0

- Fixed the fixed-position sidebar rendering underneath the fixed header instead of below it. `[data-tbf-sidebar]`'s `position: fixed` top offset defaulted to a bare `0`, so consuming apps that pair the sidebar system with a normal-flow header (rather than manually wiring `--tbf-sidebar-offset-block`) got the first ~header-height worth of sidebar content rendered behind the header and effectively invisible. It now defaults to the existing `--tbf-layout-top-offset` variable, which the layout system already keeps in sync with the actual header height.
- Removed the sidebar's block-start padding so the first sidebar item sits flush with the sidebar's own top edge instead of leaving a gap; block-end and inline padding are unchanged. Exposed as `--tbf-sidebar-padding-block-end` and `--tbf-sidebar-padding-inline` (replacing the single `--tbf-sidebar-padding` shorthand, which nothing overrode).
- Increased sidebar link inline-start padding from 11px to 16px so items no longer sit flush against the sidebar's edge. Exposed as `--tbf-sidebar-link-padding-inline-start`/`-end` (replacing `--tbf-sidebar-link-padding`, which nothing overrode).
- Gave the disclosure trigger its own style instead of sharing the dropdown-trigger/tabs-tab "chip" rule, which gave it its own border and background independent of the disclosure's own card wrapper — so a card disclosure visually looked like a bordered button nested inside another card rather than one seamless card. The trigger is now a plain full-width row (also resetting native `<button>` chrome, which the removed border had been masking).
- Added a real open/close animation to the disclosure panel using a `grid-template-rows` transition (0 to content height), replacing the previous instant `hidden`-attribute toggle. The panel now stays in the layout and is marked `inert` while closed instead of `hidden`, matching the `inert` convention already used by this package's modal/popover/wizard components.

## 8.3.1

- Bounded the icon server caches. The SVG markup, resolved colour, colour mode and composed HTTP response caches were plain unbounded maps keyed by icon spec, so their size was driven by request input rather than by application need; with several thousand icons available across the installed packs they could grow to tens of megabytes. Each is now a small LRU bounded to 512 entries, which covers the icon set a real page uses while keeping worst-case memory flat. Output is unchanged.

## 8.3.0

- Removed per-request filesystem and module-resolution work from the icon server. `resolveIconPackRoot()` ran full Node module resolution (`createRequire` + `require.resolve`) on every icon lookup because it was part of the SVG cache key, and `resolveIconColor()` re-read the icon file from disk with `readFileSync` on every call even when the SVG itself was already cached. Both are now memoised, the derived colour mode is cached, and `createIconSvgResponse()` caches its composed response body. Rendering an icon no longer performs any filesystem syscall after the first resolution, which matters most for server-rendered pages that emit many icons and for the `/__icons/svg` route. Output is byte-identical.

## 8.2.9

- Added `bindLiveLists`/`live.lists` runtime support so `entity_list`'s `<live-list>` marker (rendered whenever a list is given a `live: {room, event}` config) actually gets bound to something. Previously the marker was rendered but nothing ever subscribed to it, so lists relying on this feature silently never refreshed after the resource they list changed elsewhere (e.g. after creating a new item, the list stayed stale until a manual page reload). It now soft-reloads the current page on a matching live event, consistent with the existing `live.cards` wiring.

## 8.2.8

- Reversed the sidebar's bottom controls stacking order when the sidebar is minimized, so the first control (minimize) lands at the bottom instead of the top.
- Hid dynamic sidebar link count, state, and loader slots when the sidebar is minimized, matching the existing label/badge hiding so only the icon remains.

## 8.2.7

- Added a `minimized` prop to `ProductShellSidebar`, forwarded to `SidebarShell`, so consuming apps can render the sidebar's minimized state server-side instead of only correcting it client-side after mount, which caused a visible flash from expanded to minimized on full page loads.

## 8.2.6

- Fixed `ProductShellAboutButton` leaking its `productName` prop onto the rendered `<a>` element as an unrecognized DOM attribute, triggering a React warning. The label text already comes fully formed through `labels.about`, so `productName` was never read by this component.

## 8.2.5

- Fixed `mountLiveIsland`/`mountReactRoot` crashing with `TypeError: react.createElement is not a function` when a dynamic `import("react")` or `import("react-dom/client")` resolved to a CJS/ESM interop namespace object missing the top-level named exports. Both dynamic imports now fall back to `.default` when the expected export isn't found directly on the namespace.
- Fixed the sidebar's bottom controls row staying in a row and getting cut off when the sidebar is minimized; it now switches to a vertical column.

## 8.2.4

- Fixed dynamic sidebar links falling back to a full page navigation instead of SPA soft navigation. `wrapTriggerHostNode()` was called with a component reference rather than the raw `<a>` element, so it wrapped the link in an outer `data-tbf-href` span instead of setting the attribute on the anchor itself; the click handler's nested-interactive-element guard then saw the inner `<a>` as a separate element and declined to intercept the click. The action-trigger attributes are now applied directly on the anchor.

## 8.2.3

- Removed dead `config.creator` from `package.json`.
- Updated shared utilities to `@trebired/utils@^0.6.0` and replaced the removed `readPackageIdentity()` with `readPackageJsonUrl()` + `readOrganizationIdentity()`. No change to `frontendPackageName()`/`frontendConfigPath()`/`PACKAGE_VERSION` behavior.

## 8.2.2

- Fixed the dynamic sidebar loader crashing the page render when a link item has no loader path configured, which broke server-rendered navigation after sign-in and after completing the welcome flow.

## 8.2.1

- Fixed dropdown option registration running twice on bind, halving JSON config parsing and attribute writes on long option lists.
- Skipped redundant attribute writes when re-syncing dropdown option state that has not changed, cutting DOM writes on every selection change in long lists.
- Added scroll containment to dropdown option rows so browsers skip layout and paint for off-screen options in long lists.
- Fixed the dropdown search input collapsing instead of filling the available row width next to the clear button.

## 8.2.0

- Restored upload remote selections from an upload-owned hidden field slot after preserved live refreshes.
- Added remote upload selected-label configuration for app-owned external file sources.
- Cached generic search-panel records and scheduled search renders to reduce lag in long dropdowns.
- Moved search input icon wrapper styling into the shared input styles so dropdown search icons stay inside the field.
- Suppressed tooltips on text buttons while keeping icon-only controls and status indicators tooltip-enabled.

## 8.1.0

- Added upload remote-action rendering for app-owned external avatar sources.
- Added `setUploadRemoteSelection()` so apps can apply remote upload previews without package-specific lookup logic.

## 8.0.0

- Moved frontend namespace prefix ownership to `@trebired/bundler` generated TypeScript and Sass helpers.
- Removed user-facing frontend `prefix` config while keeping package DOM/CSS output under the package-owned `tbf` prefix.
- Replaced authored `tbf-*`, `data-tbf-*`, `--tbf-*`, and `tbf:*` source literals with namespace helpers.

## 7.1.17

- Updated shared utilities to `@trebired/utils@^0.4.4`.

All notable package changes are documented here.

## 7.1.16

- Updated shared utilities to `@trebired/utils@^0.4.3`.
- Moved frontend package identity/config path resolution onto the shared package identity helper.

## 7.1.15

- Kept text-link styling generic and token-driven while making hover/focus decoration changes apply instantly without package-owned animation.

## 7.1.14

- Made text-link hover feedback use animatable color and underline-color transitions instead of snapping underline style.

## 7.1.13

- Aligned advanced dropdown CSS selectors with the runtime attributes so hidden wizard-step dropdowns open and selected options style correctly.

## 7.1.12

- Tightened upload metadata text line-height and made upload metadata spacing use `gap-sm`.

## 7.1.11

- Bound dynamically assigned tooltip text so async status icons keep tooltips after preserved live refreshes.

## 7.1.10

- Removed stale portaled chrome overlays during preserved live refreshes.
- Prevented repeated locale soft-refreshes from leaving duplicate language/theme menus.

## 7.1.9

- Preserved file inputs and upload runtime state during locale-triggered live refreshes.
- Prevented upload-used pages from falling back to hard navigation during preserved soft reloads.

## 7.1.8

- Corrected `ViewportCenter` height inside padded layout content so it does not create unnecessary page overflow.
- Made href-only action triggers bind to the soft-navigation runtime and apply trigger attributes directly to host elements.
- Added pointer cursor feedback to upload cropper resize handles.

## 7.1.7

- Allowed the upload cropper stage to show resize handles when they sit on exact-fit edges.

## 7.1.6

- Kept upload cropper resize handles visible when the crop box touches the image boundary.

## 7.1.5

- Replaced upload cropper adaptive blending with paired black and white strokes for outer and inner guides.

## 7.1.4

- Made upload cropper internal guides stay above the crop face and use full adaptive contrast.

## 7.1.3

- Made upload cropper guides, borders, and handles use adaptive per-pixel contrast over the image.
- Reduced upload cropper selection lines from 4px to 2px.

## 7.1.2

- Corrected `ViewportCenter` centering when rendered inside padded layout content.

## 7.1.1

- Exported `ReloadAdapterOptions` through the public actions barrel.

## 7.1.0

- Added `ViewportCenter` as the shared viewport-centering component for layout content.
- Made locale-triggered SPA reloads request preserved live form and wizard state.

## 7.0.7

- Made locale switching use the configured SPA reload adapter and default to frontend soft reload instead of forcing a document reload.

## 7.0.6

- Fixed the upload stylesheet fallback so non-drop upload fields use solid borders even without app token overrides.

## 7.0.5

- Made upload fields use a solid border unless drag-and-drop is enabled.
- Added a visible drag-over state for drop-enabled upload fields.

## 7.0.4

- Added a tooltip panel shadow token so tooltips match other overlay surfaces.
- Made upload clear buttons use the generic localized Remove action label.
- Removed the empty upload filename native tooltip and tightened upload internal spacing.

## 7.0.3

- Made upload fields keep helper text, accepted formats, selected filenames, and single-file selections from expanding the component height.
- Added default upload button icons while keeping buttons on the configured `.btn` component styling.
- Made fixed-height wizard steps scroll overflowing content instead of clipping it.

## 7.0.1

- Updated the shared Trebired config dependency to `@trebired/configs@^0.1.2`.

## 7.0.0

- Renamed the public frontend config definer and loader helpers to `defineConfig()`, `findConfig()`, and `loadConfig()`.
- Updated generated namespace loading to use `@trebired/bundler/config`.
- Replaced the Code Discipline preset dependency with `@trebired/configs`.

## 6.16.0

- Added package-owned frontend request logging middleware for document requests, static-success suppression, and generic browser probe suppression.
- Added package-owned frontend performance middleware with request context counters, `Server-Timing`, slow-request summaries, and shared record helpers.
- Moved React document/component/root resolution observability into the frontend renderer when a package logger is supplied.

## 6.15.9

- Stopped frontend browser package logs from writing to the browser console by default, preventing dev runners from mirroring them into backend terminal logs.
- Switched frontend browser log source to the package name so browser log groups keep package-owned prefixes.

## 6.15.7

- Fixed wizard first-load height stability by hiding inactive SSR steps and removing runtime height measurement so CSS/SSR shell sizing stays stable through font readiness.

## 6.15.6

- Fixed wizard SSR sizing by rendering first/last step metadata and CSS-only initial footer visibility so the first paint matches the hydrated measured layout.

## 6.15.4

- Adopted the external `@trebired/configs` preset and updated Code Discipline tooling to `@trebired/code-discipline@^6.0.9`.
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
