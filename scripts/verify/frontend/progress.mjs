import assert from "node:assert/strict";

const ACTIVE_ATTR = "data-tbf-progress-active";

function createProgressHarness(runtime) {
  const { bindProgress, PROGRESS_ID, progress } = runtime;

  function progressRoot() {
    return document.getElementById(PROGRESS_ID);
  }

  function clearProgress() {
    progress.end(true);
    const root = progressRoot();
    if (root) {
      root.removeAttribute(ACTIVE_ATTR);
      root.querySelector("span")?.style.setProperty("transform", "scaleX(0)");
    }
  }

  function installPendingFetch() {
    let captured = null;
    let release = null;
    globalThis.fetch = async(_input, init) => {
      captured = init;
      return await new Promise((resolve) => {
          release = () => resolve(new Response("{}", {
                headers: { "Content-Type": "application/json" },
          }));
      });
    };
    bindProgress();
    return {
      captured: () => captured,
      release: () => {
        assert.equal(typeof release, "function", "fetch should have started");
        release();
      },
    };
  }

  return { bindProgress, clearProgress, installPendingFetch, progressRoot };
}

function verifyPageLoadProgress(harness) {
  document.head.innerHTML = '<meta name="csrf-token" content="token-a">';
  document.body.innerHTML = "";

  harness.bindProgress();
  assert.equal(
    harness.progressRoot()?.getAttribute(ACTIVE_ATTR),
    "true",
    "bindProgress must start progress for the page load request",
  );
  window.dispatchEvent(new Event("load"));
  harness.clearProgress();
}

async function verifyRawFetchProgress(harness) {
  const raw = harness.installPendingFetch();
  harness.clearProgress();
  const rawRequest = fetch("/raw", { method: "GET" });
  await Promise.resolve();
  assert.equal(
    harness.progressRoot()?.getAttribute(ACTIVE_ATTR),
    "true",
    "raw fetch requests must activate top progress",
  );
  raw.release();
  await rawRequest;
  harness.clearProgress();
}

async function verifyCsrfFetchProgress(harness, csrfFetch) {
  const csrf = harness.installPendingFetch();
  harness.clearProgress();
  const csrfRequest = csrfFetch("/endpoint", { method: "POST" });
  await Promise.resolve();
  assert.equal(
    harness.progressRoot()?.getAttribute(ACTIVE_ATTR),
    "true",
    "csrfFetch requests must activate top progress",
  );
  csrf.release();
  await csrfRequest;
  const captured = csrf.captured();
  assert.equal(captured.credentials, "same-origin");
  assert.equal(new Headers(captured.headers).get("X-CSRF-Token"), "token-a");
  assert.equal("progress"in captured, false);
  harness.clearProgress();
}

async function verifySilentFetchProgress(harness, csrfFetch) {
  const silent = harness.installPendingFetch();
  harness.clearProgress();
  const silentRequest = csrfFetch("/silent", { progress: false });
  await Promise.resolve();
  assert.notEqual(
    harness.progressRoot()?.getAttribute(ACTIVE_ATTR),
    "true",
    "progress:false must keep request progress silent",
  );
  silent.release();
  await silentRequest;
  harness.clearProgress();
}

async function verifyProgressRequests(context) {
  const rootRuntime = await context.importDistRoot();
  const { csrfFetch } = await context.importDist("http");
  const harness = createProgressHarness(rootRuntime);

  verifyPageLoadProgress(harness);
  await verifyRawFetchProgress(harness);
  await verifyCsrfFetchProgress(harness, csrfFetch);
  await verifySilentFetchProgress(harness, csrfFetch);
}

export { verifyProgressRequests };
