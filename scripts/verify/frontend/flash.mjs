import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyFlash(context) {
  const api = await context.importDist("flash");
  await verifyFlashStyles(context.rootDir);
  verifyFlashToast(api);
  await verifyClassicConfirm(api);
  await verifyTextConfirm(api);
  await verifyPrompt(api);
}

async function verifyFlashStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "flash", "styles", "index.scss"), "utf8");
  for (const type of ["error", "info", "success", "warn"]) {
    assert.equal(source.includes(`--tbf-flash-${type}-color`), false);
    assert.equal(source.includes(`--tbf-flash-${type}-title-color`), false);
    assert.equal(source.includes(`--tbf-flash-${type}-progress-color`), false);
    assert.equal(source.includes(`--tbf-feedback-flash-intents-${type}-icon-color`), true);
    assert.equal(source.includes(`--tbf-icon-color: var(--tbf-feedback-flash-intents-${type}-icon-color`), true);
  }
}

function verifyFlashToast(api) {
  const { flash, installFlashGlobal, showFlash, showFlashMessage } = api;
  const removedCloseSelector = [".tbf-flash", "close"].join("__");
  document.documentElement.setAttribute("data-tbf-theme", "dark");
  document.body.setAttribute("data-tbf-theme", "dark");
  const handle = showFlash.success("Saved", "Done");
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "dark");
  assert.equal(document.body.getAttribute("data-tbf-theme"), "dark");
  assert.ok(handle.element.matches("[data-tbf-flash]"));
  assert.equal(handle.element.querySelector(removedCloseSelector), null);
  assert.equal(handle.element.querySelector("strong.tbf-flash__title"), null);
  assert.equal(handle.element.querySelector("span.tbf-flash__title")?.textContent, "Saved");
  assert.equal(handle.element.querySelector(".tbf-flash__icon")?.getAttribute("data-tbf-icon"), "remixicon:checkbox-circle-line");
  assert.equal(handle.el, handle.element);
  assert.equal(typeof handle.hide, "function");
  assert.equal(typeof flash.stickyInfo, "function");
  assert.equal(typeof flash.liveError, "function");
  assert.equal(installFlashGlobal(window), flash);
  assert.equal(window.flash, flash);
  verifyLiveAndRoutedFlash(api);
}

function verifyLiveAndRoutedFlash(api) {
  const { flash, showFlashMessage } = api;
  const live = flash.liveError("Working", "Syncing", { id: "job-1", progressTone: "red" });
  assert.equal(live.element.getAttribute("data-tbf-progress-tone"), "red");
  assert.equal(live.element.querySelector(".tbf-flash__icon")?.getAttribute("data-tbf-icon"), "remixicon:error-warning-line");
  assert.equal(live.element.querySelector(".tbf-flash__close"), null);
  const routed = showFlashMessage(flash, "success", "Routed", "Done");
  assert.equal(routed.element.getAttribute("data-tbf-flash-type"), "success");
}

async function verifyClassicConfirm(api) {
  const confirmPromise = api.confirm("Confirm");
  document.querySelector(".tbf-button--strong").click();
  assert.equal(await confirmPromise, true);
}

async function verifyTextConfirm(api) {
  const attrs = api.confirmationVariantAttrs({
      confirmationText: "repository-a",
      target: "repository-a",
      variant: "delete",
  });
  const button = document.createElement("button");
  Object.entries(attrs).forEach(([key, value]) => button.setAttribute(key, value));
  document.body.appendChild(button);
  const elementConfirmPromise = api.confirmElement(button);
  const confirmInput = document.querySelector(".tbf-flash__body input");
  confirmInput.value = "repository-a";
  confirmInput.dispatchEvent(new Event("input", { bubbles: true }));
  confirmInput.closest(".tbf-flash").querySelector(".tbf-button--strong").click();
  assert.equal(await elementConfirmPromise, true);
}

async function verifyPrompt(api) {
  const promptPromise = api.prompt("Name");
  const input = document.querySelector(".tbf-flash__form input");
  input.value = "Atlas";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.querySelector(".tbf-flash__form").dispatchEvent(
    new SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(await promptPromise, "Atlas");
}

export { verifyFlash };
