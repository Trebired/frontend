import path from "node:path";

import { frontendConfigPath } from "./package.js";
import { normalizeFrontendConfig } from "./normalize.js";

type StartupRequirementFailure = {
  check: string;
  message: string;
  reason?: string;
  status_code: string;
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
          check: REQUIREMENT,
          message: `frontend config could not be loaded from ${file}`,
          reason: error instanceof Error ? error.message : String(error),
          status_code: "frontend-config-unreadable",
      }] satisfies StartupRequirementFailure[];
    }

    try {
      normalizeFrontendConfig(source, { configPath: file });
    } catch (error) {
      return [{
          check: REQUIREMENT,
          message: error instanceof Error ? error.message : String(error),
          status_code: "frontend-config-invalid",
      }] satisfies StartupRequirementFailure[];
    }

    return [];
  };
}

export { frontendConfigCheck };
export type { FrontendConfigCheckOptions };
