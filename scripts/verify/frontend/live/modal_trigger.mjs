import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyModalTrigger(context) {
  const root = await context.importDistRoot();
  const react = await context.importDist("react");
  const card = renderToStaticMarkup(createElement(() => react.card_body({ actionTrigger: { modal: "user_modal" }, title: "User" })));
  assert.match(card, /data-tbf-action-modal="user_modal"/u, "a card names the modal it opens");
  document.body.innerHTML = `<main data-tbf-live-content>${card}<div id="user_modal" data-tbf-modal="" hidden><button>Close</button></div></main>`;
  const runtime = root.bindFrontendRuntime(document, { observe: false, quiet: true });
  try {
    const trigger = document.querySelector("[data-tbf-action-modal]");
    assert.equal(trigger.getAttribute("role"), "button", "the card is announced as a button");
    trigger.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const modal = document.getElementById("user_modal");
    assert.equal(modal.getAttribute("aria-hidden"), "false", "clicking the card opens its modal");
  } finally {
    root.closeAllModals?.();
    runtime.disconnect();
    document.body.innerHTML = "";
  }
}

export { verifyModalTrigger };
