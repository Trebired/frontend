import React from "react";
import { createRoot } from "react-dom/client";
import { parseJsonText } from "#er0dlx1gtbzh";
import { graphIsWaitingForModal, logGraphLifecycle } from "./utils.js";
import { GraphErrorBoundary } from "./render.js";
import { GraphCard } from "./card.js";

function readGraphBootData(bootId) {
  const key = normalizeBootKey(bootId);
  if (!key || typeof document === "undefined") return null;
  const element = document.getElementById(key);
  if (!element) return null;
  const raw =
  element instanceof HTMLTemplateElement
  ? element.content && typeof element.content.textContent === "string"
  ? element.content.textContent
  : element.textContent
  : element.textContent;
  return parseJsonText(raw || "", null);
}

function normalizeBootKey(value) {
  return String(value || "").trim();
}

function stripBootSuffix(value) {
  const text = normalizeBootKey(value);
  return text.endsWith("_boot") ? text.slice(0, -5) : text;
}

function bootCandidates(value) {
  const text = normalizeBootKey(value);
  if (!text) return [];

  const values = new Set([text]);
  const base = stripBootSuffix(text);

  if (base) {
    values.add(base);
    values.add(`${base}_boot`);
  }

  return Array.from(values);
}

function mountCandidates(inputId, boot) {
  const values = new Set<string>();
  const bootGraphId = normalizeBootKey(boot && boot.id);
  const base = stripBootSuffix(inputId);

  if (bootGraphId) values.add(`${bootGraphId}_mount`);
  if (base) values.add(`${base}_mount`);

  return Array.from(values);
}

function resolveGraphBoot(bootId) {
  const candidates = bootCandidates(bootId);
  const resolved = candidates
  .map((candidate) => ({
        candidate,
        boot: readGraphBootData(candidate),
  }))
  .find((entry) => entry.boot && entry.boot.id);

  if (resolved && resolved.boot && resolved.boot.id) {
    return {
      boot: resolved.boot,
      candidates,
      inputId: resolved.candidate,
    };
  }

  return {
    boot: null,
    candidates,
    inputId: normalizeBootKey(bootId),
  };
}

function resolveGraphMount(inputId, boot) {
  const candidates = mountCandidates(inputId, boot);
  const mountEl = candidates
  .map((candidate) => document.getElementById(candidate))
  .find(Boolean);

  return {
    candidates,
    mountEl,
  };
}

function logMissingBoot(bootId, candidates) {
  logGraphLifecycle(
    "boot-missing",
    {
      requested_boot_id: bootId,
      candidates,
    },
    "warn",
  );
}

function logMissingMount(bootId, inputId, boot, mountInfo) {
  logGraphLifecycle(
    "mount-missing",
    {
      requested_boot_id: bootId,
      resolved_boot_id: inputId,
      graph_id: boot.id,
      mount_candidates: mountInfo.candidates,
    },
    "warn",
  );
}

function logRootCreated(bootId, inputId, boot, mountEl) {
  logGraphLifecycle("root-created", {
      requested_boot_id: bootId,
      resolved_boot_id: inputId,
      graph_id: boot.id,
      mount_id: mountEl.id || "",
      modal_waiting: graphIsWaitingForModal(mountEl),
  });
}

function renderGraphCard(root, props) {
  logGraphLifecycle("render", {
      graph_id: props.id,
      loading: props.loading === true,
      state: props.state,
      point_count: Array.isArray(props.points) ? props.points.length : 0,
      dataset_count: Array.isArray(props.datasets) ? props.datasets.length : 0,
      modal_waiting: props.modalWaiting === true,
  });

  root.render(
    React.createElement(
      GraphErrorBoundary,
      { graphProps: props },
      React.createElement(GraphCard, props),
    ),
  );
}

function createGraphController(boot, mountEl) {
  const root = createRoot(mountEl);
  let props = {
    ...boot,
    modalWaiting: graphIsWaitingForModal(mountEl),
  };

  function render(nextProps) {
    props = {
      ...props,
      ...(nextProps && typeof nextProps === "object" ? nextProps : {}),
    };

    renderGraphCard(root, props);
  }

  render(props);

  return {
    render,
    resize() {
      logGraphLifecycle("resize", {
          graph_id: props.id || "",
      });
      render({ resizeNonce: Date.now() });
    },
    setLoading(value) {
      logGraphLifecycle("set-loading", {
          graph_id: props.id || "",
          loading: value === true,
      });
      render({ loading: value === true });
    },
  };
}

export function createGraphRoot(bootId) {
  const bootInfo = resolveGraphBoot(bootId);
  if (!bootInfo.boot || !bootInfo.boot.id) {
    logMissingBoot(bootId, bootInfo.candidates);
    return null;
  }

  const mountInfo = resolveGraphMount(bootInfo.inputId, bootInfo.boot);
  if (!mountInfo.mountEl) {
    logMissingMount(bootId, bootInfo.inputId, bootInfo.boot, mountInfo);
    return null;
  }

  logRootCreated(bootId, bootInfo.inputId, bootInfo.boot, mountInfo.mountEl);
  return createGraphController(bootInfo.boot, mountInfo.mountEl);
}

const graph = Object.freeze({
    createGraphRoot,
});

export default graph;
