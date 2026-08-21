import { bindLogEvents, loadInitialLogs, loadOlderLogs } from "./detail.js";
import { resolveLogsDomRoot } from "./dom.js";
import { syncGroupSelect, syncLevelSelect } from "./dropdowns.js";
import { connectLogs } from "./socket.js";
import { DEFAULT_LOGS_INSTANCE_ID } from "./types.js";
import type { LogsConfig } from "./types.js";
import { normalizeInstanceId, normalizeLogsConfig } from "./utils.js";
import {
  flushFrontendLogsBuffer,
  forceViewportToBottom,
  focusSearchInputAfterFullscreenOpen,
  focusSearchInputAfterFullscreenRequest,
  refreshLogDom,
  syncMetadataButton,
  syncViewportFromScroll,
} from "./view_state.js";
import { createLogsPage, isEquivalentLogsConfig } from "./page.js";
import {
  deleteLogsPartialPage,
  readLogsPartialPage,
  setLogsPartialPage,
} from "./page_registry.js";
import { ingestFrontendLogs } from "./ingest.js";
import { renderLogs } from "./render.js";
import { replaceLogsPartialData } from "./replace.js";
import { registerPageCleanup } from "#o9lroe7t0ma6";

const logsPartialRoots = new Set<HTMLElement>();

function bootstrapLogsPartial(
  options: {
    root?: HTMLElement | string | null;
    instanceId?: string;
    config?: LogsConfig | null;
    connect?: boolean;
  } = {},
) {
  const page: any = createLogsPage(options);
  if (!page.ui.root || !page.ui.box || !page.ui.scrollBox) return null;
  logsPartialRoots.add(page.ui.root);
  registerPageCleanup(page.ui.root, () => {
      disconnectLogsPartialRoot(page.ui.root, true);
      logsPartialRoots.delete(page.ui.root);
  });

  const existing = readLogsPartialPage(page.ui.root);
  if (existing) return bootstrapExistingLogsPartial(existing, options);

  return bootstrapNewLogsPartial(page, options);
}

function bootstrapExistingLogsPartial(existing: any, options: any) {
  const nextConfig =
  options && options.config && typeof options.config === "object"
  ? normalizeLogsConfig(options.config, {
      instanceId: existing.instanceId,
  })
  : null;
  const sameConfig = nextConfig
  ? isEquivalentLogsConfig(existing.config, nextConfig)
  : true;
  if (nextConfig && !sameConfig) replaceLogsPartialData(existing, nextConfig);
  if (!options || options.connect !== false)
  connectExistingLogsPartial(existing, sameConfig);
  return existing;
}

function connectExistingLogsPartial(existing: any, sameConfig: boolean) {
  if (sameConfig && existing.state && existing.state.socket) return;
  closeExistingSocket(existing);
  resetEmptyExistingLogs(existing);
  if (!existing.state.socket) {
    connectLogs(existing, {
        renderPage: renderLogs,
        syncGroupSelect,
        syncLevelSelect,
    });
  }
  void loadInitialLogs(existing, {
      renderLogs,
      syncGroupSelect,
      syncLevelSelect,
  });
}

function closeExistingSocket(existing: any) {
  if (!existing.state || !existing.state.socket) return;
  try {
    existing.state.socket.close();
  } catch {}
  existing.state.socket = null;
}

function resetEmptyExistingLogs(existing: any) {
  if (!existing.state || !Array.isArray(existing.state.allLogs)) return;
  if (existing.state.allLogs.length !== 0) return;
  existing.state.didBootstrap = false;
  existing.state.socketMessage = "";
  renderLogs(existing);
}

function bootstrapNewLogsPartial(page: any, options: any) {
  setLogsPartialPage(page.ui.root, page);
  if (
    (!options || options.connect !== false) &&
      Array.isArray(page.state.allLogs) &&
      page.state.allLogs.length === 0
  ) {
    page.state.didBootstrap = false;
  }

  bindLogEvents(page, logEventHandlers());
  syncGroupSelect(page);
  syncLevelSelect(page);
  forceViewportToBottom(page);
  renderLogs(page);
  if (!options || options.connect !== false) {
    connectLogs(page, {
        renderPage: renderLogs,
        syncGroupSelect,
        syncLevelSelect,
    });
  }
  void loadInitialLogs(page, { renderLogs, syncGroupSelect, syncLevelSelect });
  return page;
}

function logEventHandlers() {
  return {
    forceViewportToBottom,
    focusSearchInputAfterFullscreenOpen,
    focusSearchInputAfterFullscreenRequest,
    refreshLogDom,
    renderLogs,
    syncMetadataButton,
    syncViewportFromScroll: (nextPage) =>
    syncViewportFromScroll(nextPage, {
        loadOlderLogs: (pageToLoad) =>
        loadOlderLogs(pageToLoad, {
            renderLogs,
            syncGroupSelect,
            syncLevelSelect,
        }),
        renderLogs,
    }),
  };
}

function disconnectLogsPartial(
  target:
  | {
    root?: HTMLElement | string | null;
    instanceId?: string;
  }
  |HTMLElement
  |string
  |null = null,
) {
  const src: any =
  target && typeof target === "object" && !(target instanceof HTMLElement)
  ? target
  : { root: target };
  const instanceId = src && typeof src === "object" ? src.instanceId : "";
  const root = resolveLogsDomRoot(
    src && typeof src === "object" ? src.root : target,
    instanceId || "",
  );
  const page = readLogsPartialPage(root);
  if (!page) return false;

  return disconnectLogsPartialRoot(root, false);
}

function closeLogsPageSockets(page: any) {
  for (const key of ["socket", "pagedLiveSocket"]) {
    if (!page || !page.state || !page.state[key]) continue;
    try {
      page.state[key].close();
    } catch {}
    page.state[key] = null;
  }
}

function disconnectLogsPartialRoot(
  root: HTMLElement | null,
  unregister: boolean,
) {
  const page = readLogsPartialPage(root);
  if (!page) return false;
  closeLogsPageSockets(page);
  if (root && unregister) {
    logsPartialRoots.delete(root);
    deleteLogsPartialPage(root);
  }
  return true;
}

function bootstrapLogsPartials(
  options: {
    configByInstance?: Record<string, LogsConfig>;
    connect?: boolean;
  } = {},
) {
  const roots = Array.from(logsPartialRoots).filter((root) => {
      if (root.isConnected) return true;
      logsPartialRoots.delete(root);
      return false;
  });

  return roots
  .map((root) => bootstrapLogsPartial(buildPartialOptions(root, options)))
  .filter(Boolean);
}

function buildPartialOptions(root: HTMLElement, options: any) {
  const instanceId = normalizeInstanceId(
    root.getAttribute("data-logs-instance-id"),
  );
  const config =
  options.configByInstance && options.configByInstance[instanceId]
  ? options.configByInstance[instanceId]
  : null;
  return {
    root,
    instanceId: instanceId || DEFAULT_LOGS_INSTANCE_ID,
    config,
    connect: options.connect,
  };
}

function bootLogsPartialsOnce() {
  bootstrapLogsPartials();
  flushFrontendLogsBuffer(ingestFrontendLogs);
}

function bindLogsPartialElement(root: HTMLElement) {
  logsPartialRoots.add(root);
  const page = bootstrapLogsPartial(buildPartialOptions(root, {}));
  flushFrontendLogsBuffer(ingestFrontendLogs);
  return page;
}

export {
  bindLogsPartialElement,
  bootLogsPartialsOnce,
  bootstrapLogsPartial,
  bootstrapLogsPartials,
  disconnectLogsPartial,
};
