/**
 * Placeholder for the build-time static icon cache.
 *
 * When the app is built with `@trebired/bundler` and the frontend config sets
 * `assets.icons.mode: "static"` with `assets.icons.specs`, the bundler replaces
 * this module with a generated one that registers the rendered icons. Importing
 * it without that build step is a no-op, so the import is always safe.
 */
const staticIcons: Record<string, never> = {};

export { staticIcons };
export default staticIcons;
