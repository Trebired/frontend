import path from "node:path";

import { frontendConfigPath } from "./package.js";
import { normalizeFrontendConfig } from "./normalize.js";

type StartupRequirementFailure = {
  detail?: string;
  message: string;
  requirement: string;
};

type FrontendConfigCheckOptions = {
  configPath?: string;
  cwd?: string;
};

const REQUIREMENT = "frontend-config";

async function loadConfigModule(file: string): Promise<unknown> {
  const module = (await import(file)) as { default?: unknown };
  return module.default ??module;
}

function frontendConfigCheck(options: FrontendConfigCheckOptions = {}) {
  return async function checkFrontendConfig(context: { cwd?: string }) {
    const cwd = options.cwd || context.cwd || process.cwd();
    const file = path.resolve(cwd, options.configPath || frontendConfigPath());
    let source: unknown;
    try {
      source = await loadConfigModule(file);
    } catch (error) {
      return [{
          detail: error instanceof Error ? error.message : String(error),
          message: `frontend config could not be loaded from ${file}`,
          requirement: REQUIREMENT,
      }] satisfies StartupRequirementFailure[];
    }

    try {
      normalizeFrontendConfig(source, { configPath: file });
    } catch (error) {
      return [{
          message: error instanceof Error ? error.message : String(error),
          requirement: REQUIREMENT,
      }] satisfies StartupRequirementFailure[];
    }

    return [];
  };
}

export { frontendConfigCheck };
export type { FrontendConfigCheckOptions };
