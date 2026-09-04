import type { NormalizedFrontendConfig } from "./types.js";

const STATIC_ICONS_SPECIFIER = "@trebired/frontend/static-icons";

type GeneratedStaticIconsModule = {
  contents: string;
  count: number;
  specs: string[];
};

function emptyStaticIconsModule(): GeneratedStaticIconsModule {
  return {
    contents: "export {};\n",
    count: 0,
    specs: [],
  };
}

async function generateStaticIconsModule(
  config: NormalizedFrontendConfig,
  options: { rootDir?: string } = {},
): Promise<GeneratedStaticIconsModule> {
  const icons = config?.assets?.icons;
  const specs = Array.isArray(icons?.specs) ? icons.specs : [];
  if (icons?.mode !== "static" || !specs.length) return emptyStaticIconsModule();

  const { buildStaticIconCache } = await import("#4gh1zj5qcwle");
  const cache = buildStaticIconCache(specs, {
      packs: icons.packs,
      rootDir: options.rootDir,
    } as never);
  const entries = Object.keys(cache);
  if (!entries.length) return emptyStaticIconsModule();

  const literal = JSON.stringify(cache, null, 2).replace(/</gu, "\\u003c");
  return {
    contents: [
      'import { registerStaticIcons } from "@trebired/frontend";',
      "",
      `const staticIcons = ${literal};`,
      "",
      "registerStaticIcons(staticIcons);",
      "",
      "export { staticIcons };",
      "export default staticIcons;",
      "",
    ].join("\n"),
    count: entries.length,
    specs: [...specs],
  };
}

export { STATIC_ICONS_SPECIFIER, generateStaticIconsModule };
export type { GeneratedStaticIconsModule };
