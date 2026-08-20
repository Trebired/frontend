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
  const live = await context.importDist("live");
  const { frontendEventName } = await context.importDistRoot();
  document.body.innerHTML = simpleLiveMarkup("before");
  const events = [];
  const disposeOff = live.onLivePageDispose((detail) => {
      assert.equal(document.querySelector("[data-tbf-live-content]").textContent, "before");
      assert.equal(detail.root.getAttribute("data-marker"), "before");
  });
  bindLifecycleEventCapture(frontendEventName, events);
  mockLiveFetch(simpleLiveMarkup("after"), "After");
  const result = await live.softVisit("/next?tab=1", { history: "none" });
  disposeOff();

  assert.equal(result, true);
  assertLifecycleEvents(events);
  assert.equal(document.querySelector("[data-tbf-live-content]").textContent, "after");
  assert.equal(live.currentLivePage().pageId, "/next?tab=1");
}

function bindLifecycleEventCapture(frontendEventName, events) {
  ["live-navigation-start", "live-page-dispose", "live-content-updated", "live-navigation"]
  .forEach((name) => {
      document.addEventListener(frontendEventName(name), (event) => {
          events.push({ detail: event.detail, name });
        }, { once: true });
  });
}

function assertLifecycleEvents(events) {
  assert.deepEqual(events.map((event) => event.name), [
      "live-navigation-start",
      "live-page-dispose",
      "live-content-updated",
      "live-navigation",
  ]);
  assert.equal(events[0].detail.navigationId, events[3].detail.navigationId);
  assert.equal(events[3].detail.pageId, "/next?tab=1");
}

async function verifyLiveNavigationStaleGuard(context) {
  const live = await context.importDist("live");
  document.body.innerHTML = simpleLiveMarkup(
    "stale",
    '<span id="stale_target">old</span>',
  );
  const staleNavigationId = live.currentLivePage().navigationId;
  mockLiveFetch(simpleLiveMarkup("fresh", '<span id="fresh_target">new</span>'));
  const visit = live.softVisit("/fresh", { history: "none" });
  let staleMutated = false;
  await Promise.resolve().then(() => {
      if (!live.isCurrentLivePage(staleNavigationId)) return;
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
  const { softVisit } = await context.importDist("live");
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

  assert.equal(await softVisit("/without-logs", { history: "none" }), true);
  assert.equal(closed, 2);
  assert.equal(disconnectLogsPartial(root), false);
}

async function verifyLiveScopedSubscriptionDisposal(context) {
  const live = await context.importDist("live");
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

  assert.equal(await live.softVisit("/next-page", { history: "none" }), true);
  assert.equal(unsubscribed, 2);
}

export {
  verifyLiveLogsSocketDisposal,
  verifyLiveNavigationLifecycle,
  verifyLiveNavigationStaleGuard,
  verifyLiveScopedSubscriptionDisposal,
};
