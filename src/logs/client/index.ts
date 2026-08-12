import { bindCodeBlocks } from "#gi2c2fgone4i";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import {
  bindLogsPartialElement,
  bootstrapLogsPartial,
  bootstrapLogsPartials,
  disconnectLogsPartial,
} from "./bootstrap.js";
import { ingestFrontendLogs } from "./ingest.js";
import { setLogsPartialManager } from "./bridge.js";
import { createLogsPage } from "./page.js";
import { renderLogs } from "./render.js";
import { replaceLogsPartialData } from "./replace.js";

function installLogsPartialManager() {
  setLogsPartialManager({
      bootstrapLogsPartial,
      bootstrapLogsPartials,
      disconnectLogsPartial,
      ingestFrontendLogs,
      replaceLogsPartialData,
  });
}

function bindLogsRuntime(root: BindRoot = document) {
  if (typeof document === "undefined") return [];
  const scope = root && "querySelectorAll"in root ? root : document;
  bindCodeBlocks(scope);
  installLogsPartialManager();
  return queryAll<HTMLElement>(scope, "[data-tbf-logs-partial]").map((partialRoot) =>
    bindLogsPartialElement(partialRoot),
  );
}

export {
  bootstrapLogsPartial,
  bootstrapLogsPartials,
  createLogsPage,
  disconnectLogsPartial,
  bindLogsRuntime,
  ingestFrontendLogs,
  renderLogs,
  replaceLogsPartialData,
};

if (typeof document !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => bindLogsRuntime(document), {
      once: true,
  });
} else if (typeof document !== "undefined") {
  bindLogsRuntime(document);
}
