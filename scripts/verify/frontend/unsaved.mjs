import assert from "node:assert/strict";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function dialogButton(text) {
  const matches = Array.from(document.querySelectorAll("button")).filter((button) => button.textContent.trim() === text);
  return matches[matches.length - 1] || null;
}

async function waitForButton(text) {
  for (let index = 0; index < 40; index += 1) {
    const button = dialogButton(text);
    if (button) return button;
    await wait(25);
  }
  return null;
}

async function verifyUnsavedWorkStaysSoft(context) {
  const root = await context.importDistRoot();
  const spa = await context.importDist("spa");
  document.body.innerHTML = '<main data-tbf-live-content><span id="before">Before</span></main>';
  history.replaceState({}, "", "/editing");
  let fetched = 0;
  let assigned = "";
  const previousFetch = globalThis.fetch;
  const previousAssign = window.location.assign;
  globalThis.fetch = async(input) => {
    if (String(input).startsWith("/next")) fetched += 1;
    return new Response('<!doctype html><html><body><main data-tbf-live-content><span id="after">After</span></main></body></html>', {
        headers: { "Content-Type": "text/html" },
    });
  };
  window.location.assign = (url) => {
    assigned = String(url);
  };
  const dispose = spa.registerUnsavedWork(() => true);
  try {
    const stayed = root.softRedirect("/next");
    (await waitForButton("Stay")).click();
    assert.equal(await stayed, false, "choosing to stay cancels the navigation");
    assert.equal(fetched, 0, "nothing is fetched when the reader stays");
    assert.ok(document.getElementById("before"), "the page is kept");
    for (let index = 0; index < 40 && document.querySelector("[data-tbf-flash]"); index += 1) await wait(25);
    const left = root.softRedirect("/next");
    (await waitForButton("Leave")).click();
    assert.equal(await left, true, "choosing to leave navigates");
    assert.ok(document.getElementById("after"), "the new page is swapped in softly");
    assert.equal(assigned, "", "unsaved work never turns a navigation into a full page load");
  } finally {
    dispose();
    globalThis.fetch = previousFetch;
    window.location.assign = previousAssign;
    history.replaceState({}, "", "/current");
  }
}

export { verifyUnsavedWorkStaysSoft };
