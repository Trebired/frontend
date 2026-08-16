import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

function graphModalForNode(node) {
  if (!(node instanceof Element)) return null;
  const modal = node.closest(frontendDataSelector("modal"));
  return modal instanceof HTMLElement ? modal : null;
}

function graphModalReady(modal) {
  if (!modal) return true;
  return (
    modal.hasAttribute(frontendDataAttr("open")) &&
      !modal.hasAttribute(frontendDataAttr("opening")) &&
      modal.getAttribute("aria-hidden") !== "true"
  );
}

function graphIsWaitingForModal(node) {
  const modal = graphModalForNode(node);
  return Boolean(modal && !graphModalReady(modal));
}

function waitForStableGraphModal(node, callback, waitingCallback) {
  const modal = graphModalForNode(node);

  if (!modal) {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
    return () => {};
  }

  if (graphModalReady(modal)) {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
    return () => {};
  }

  if (typeof waitingCallback === "function") waitingCallback(true);
  const onReady = () => {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
  };
  modal.addEventListener(frontendEventName("modal-ready"), onReady, { once: true });
  return () => modal.removeEventListener(frontendEventName("modal-ready"), onReady);
}

export {
  graphIsWaitingForModal,
  waitForStableGraphModal,
};
