import { applyPresets } from "@trebired/utils";
import { collectConfigDependencies, importConfigModule } from "./module.js";
import { PACKAGE_VERSION } from "./package.js";
import type { FrontendConfig } from "./types.js";

type FrontendPresetsConfig = NonNullable<FrontendConfig["presets"]>;

type ResolvedFrontendPresets = {
  config: unknown;
  dependencies: string[];
};

async function applyFrontendPresets(config: unknown, projectRoot: string): Promise<ResolvedFrontendPresets> {
  const dependencies: string[] = [];
  const applied = await applyPresets(config, {
      importModule: async(file) => {
        const fileDependencies = await collectConfigDependencies(file);
        dependencies.push(...fileDependencies);
        return importConfigModule(projectRoot, file, fileDependencies);
      },
      label: "frontend",
      packageName: "frontend",
      packageVersion: PACKAGE_VERSION,
      projectRoot,
  });
  return { config: applied.config, dependencies };
}

export { applyFrontendPresets };
export type { FrontendPresetsConfig, ResolvedFrontendPresets };
