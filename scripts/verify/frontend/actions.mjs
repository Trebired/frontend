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

async function verifyActionTriggerNavigation(importDistRoot) {
  const { bindFrontendRuntime } = await importDistRoot();
  document.body.innerHTML = [
    '<a id="soft" href="/welcome" data-tbf-href="/welcome">',
    "<span>Start</span>",
    "</a>",
  ].join("");
  let navigated = "";
  bindFrontendRuntime(document, {
      adapters: {
        navigation: {
          navigate(url) {
            navigated = url;
          },
        },
      },
      observe: false,
      quiet: true,
  });
  document.querySelector("#soft span").click();
  assert.equal(navigated, "/welcome");
}

async function verifyFrontendActions(context) {
  await verifyActionTriggerNavigation(context.importDistRoot);
  await verifyActionConfetti(context.importDist);
}

export { verifyFrontendActions };
