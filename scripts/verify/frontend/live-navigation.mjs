import assert from "node:assert/strict";

function simpleLiveMarkup(marker, body = "") {
  return `<div data-tbf-live-content data-marker="${marker}">${body || marker}</div>`;
}

function liveDocument(markup, title = "Next") {
  return `<!doctype html><html lang="cs"><head><title>${title}</title></head><body>${markup}</body></html>`;
}

function mockLiveFetch(markup, title = "Next") {
  globalThis.fetch = async() => {
    return new Response(liveDocument(markup, title), {
        headers: { "Content-Type": "text/html" },
    });
  };
}

async function verifyLiveNavigationLifecycle(context) {
  const spa = await context.importDist("spa");
  document.body.innerHTML = simpleLiveMarkup("before");
  const order = [];
  const unregister = spa.registerPageCleanup(
    document.querySelector("[data-tbf-live-content]"),
    () => {
      order.push("cleanup");
      assert.equal(
        document.querySelector("[data-tbf-live-content]").getAttribute("data-marker"),
        "before",
        "cleanups must run before the old content is replaced",
      );
    },
  );
  const off = spa.onPageChange((page) => {
      order.push("page-change");
      assert.equal(page.pageId, "/next?tab=1");
      assert.equal(
        document.querySelector("[data-tbf-live-content]").getAttribute("data-marker"),
        "after",
        "page-change must fire after the new content is in the DOM",
      );
  });
  mockLiveFetch(simpleLiveMarkup("after"), "After");
  const result = await spa.softRedirect("/next?tab=1", { history: "none" });
  off();
  unregister();

  assert.equal(result, true);
  assert.deepEqual(order, ["cleanup", "page-change"]);
  assert.equal(document.querySelector("[data-tbf-live-content]").textContent, "after");
  assert.equal(spa.currentPage().pageId, "/next?tab=1");
}

async function verifyLiveNavigationProgress(context) {
  const spa = await context.importDist("spa");
  const { PROGRESS_ID } = await context.importDist("progress");
  document.body.innerHTML = simpleLiveMarkup("before");
  mockLiveFetch(simpleLiveMarkup("after"));

  const seen = [];
  const observer = new MutationObserver(() => {
      const root = document.getElementById(PROGRESS_ID);
      seen.push(root?.getAttribute("data-tbf-progress-active") === "true");
  });
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });

  assert.equal(await spa.softRedirect("/progress-page", { history: "none" }), true);
  observer.disconnect();

  assert.ok(seen.some(Boolean), "progress must become active during a soft navigation");
}

async function verifyLiveNavigationStaleGuard(context) {
  const spa = await context.importDist("spa");
  document.body.innerHTML = simpleLiveMarkup(
    "stale",
    '<span id="stale_target">old</span>',
  );
  const staleNavigationId = spa.currentPage().navigationId;
  mockLiveFetch(simpleLiveMarkup("fresh", '<span id="fresh_target">new</span>'));
  const visit = spa.softRedirect("/fresh", { history: "none" });
  let staleMutated = false;
  await Promise.resolve().then(() => {
      if (spa.currentPage().navigationId !== staleNavigationId) return;
      staleMutated = true;
      document.getElementById("stale_target")?.setAttribute("data-mutated", "true");
  });
  await visit;

  assert.equal(staleMutated, false);
  assert.equal(document.getElementById("fresh_target").textContent, "new");
}

function logsLiveMarkup(marker = "logs") {
  return simpleLiveMarkup(marker, [
      '<section id="logs-view-partial" data-tbf-logs-partial data-logs-instance-id="logs-view">',
      '<div id="logs-view-box"></div>',
      "</section>",
    ].join(""));
}

async function verifyLiveLogsSocketDisposal(context) {
  const { bootstrapLogsPartial, disconnectLogsPartial } = await context.importDist("logs");
  const { softRedirect } = await context.importDist("spa");
  document.body.innerHTML = logsLiveMarkup();
  const root = document.getElementById("logs-view-partial");
  const page = bootstrapLogsPartial({
      config: { allowEmptyScopeIds: true, config_key: "logs-a" },
      connect: false,
      root,
  });
  let closed = 0;
  page.state.socket = { close() { closed += 1; } };
  page.state.pagedLiveSocket = { close() { closed += 1; } };
  mockLiveFetch(simpleLiveMarkup("next"));

  assert.equal(await softRedirect("/without-logs", { history: "none" }), true);
  assert.equal(closed, 2);
  assert.equal(disconnectLogsPartial(root), false);
}

async function verifyLiveScopedSubscriptionDisposal(context) {
  const live = await context.importDist("live");
  const { softRedirect } = await context.importDist("spa");
  document.body.innerHTML = simpleLiveMarkup("before", [
      '<div data-tbf-live-card data-tbf-live-kind="task" data-tbf-live-id="1">Card</div>',
      '<live-list data-live-list-room="tasks"></live-list>',
    ].join(""));
  let unsubscribed = 0;
  const subscribe = () => () => {
    unsubscribed += 1;
  };
  live.bindLiveCards(document, { subscribe });
  live.bindLiveLists(document, { subscribe, reload() {} });
  mockLiveFetch(simpleLiveMarkup("next"));

  assert.equal(await softRedirect("/next-page", { history: "none" }), true);
  assert.equal(unsubscribed, 2);
}

export {
  verifyLiveLogsSocketDisposal,
  verifyLiveNavigationProgress,
  verifyLiveNavigationLifecycle,
  verifyLiveNavigationStaleGuard,
  verifyLiveScopedSubscriptionDisposal,
};
