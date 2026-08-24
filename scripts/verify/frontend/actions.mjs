import assert from "node:assert/strict";

async function verifyActionConfetti(importDist) {
  const { submitActionButton } = await importDist("actions");
  let count = 0;
  document.addEventListener("tbf:confetti", () => {
      count += 1;
  });
  globalThis.fetch = async() => {
    return new Response(JSON.stringify({ ok: true, message: "Saved." }), {
        headers: { "Content-Type": "application/json" },
    });
  };
  const plain = document.createElement("button");
  await submitActionButton(plain, undefined, { url: "/ok" });
  assert.equal(count, 0);
  const configured = document.createElement("button");
  configured.setAttribute("data-tbf-confetti", "true");
  await submitActionButton(configured, undefined, { url: "/ok" });
  assert.equal(count, 1);
}

async function verifySoftRedirectAnchorNavigation(importDistRoot) {
  const { bindFrontendRuntime } = await importDistRoot();
  document.body.innerHTML = [
    '<main data-tbf-live-content>',
    '<span id="swallowing_control">',
    '<a id="soft" href="/welcome">',
    "<span>Start</span>",
    "</a>",
    "</span>",
    "</main>",
  ].join("");
  let requested = "";
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async(input) => {
    requested = String(input);
    return new Response(
      [
        "<!doctype html><html><head><title>Welcome</title></head><body>",
        '<main data-tbf-live-content><span id="welcome_marker">Welcome</span></main>',
        "</body></html>",
      ].join(""),
      { headers: { "Content-Type": "text/html" } },
    );
  };
  const runtime = bindFrontendRuntime(document, {
      observe: false,
      quiet: true,
  });
  document.getElementById("swallowing_control").addEventListener("click", (event) => {
      event.stopPropagation();
  });
  try {
    document.querySelector("#soft span").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(requested, "/welcome");
    assert.equal(document.getElementById("welcome_marker")?.textContent, "Welcome");
  } finally {
    runtime.disconnect();
    globalThis.fetch = previousFetch;
    history.replaceState({}, "", "/current");
  }
}

async function verifyFrontendActions(context) {
  await verifySoftRedirectAnchorNavigation(context.importDistRoot);
  await verifyActionConfetti(context.importDist);
}

export { verifyFrontendActions };
