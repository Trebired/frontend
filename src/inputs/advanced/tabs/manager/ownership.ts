import { toString } from "#dqy2d22qyujv";

const ownedNodesByOwner = new Map<string, Set<HTMLElement>>();

let tabsOwnerSequence = 0;

function descendantNodes(root, selector) {
  return Array.from(root.querySelectorAll(selector)).filter((node) => {
      return (
        node instanceof HTMLElement && node.closest("[data-tabs-root]") === root
      );
  });
}

function tabsOwnerId(root) {
  if (!(root instanceof HTMLElement)) return "";
  const existing = toString(root.getAttribute("data-tabs-owner"));
  if (existing) return existing;
  tabsOwnerSequence += 1;
  const next = `tabs_owner_${tabsOwnerSequence}`;
  root.setAttribute("data-tabs-owner", next);
  ownedNodesByOwner.set(next, new Set());
  return next;
}

function registerOwnedNode(ownerId, node) {
  if (!(node instanceof HTMLElement) || !ownerId) return;
  let nodes = ownedNodesByOwner.get(ownerId);
  if (!nodes) {
    nodes = new Set();
    ownedNodesByOwner.set(ownerId, nodes);
  }
  nodes.add(node);
}

function markOwnedTree(node, ownerId) {
  if (!(node instanceof HTMLElement) || !ownerId) return;
  node.setAttribute("data-tabs-owner", ownerId);
  registerOwnedNode(ownerId, node);
  Array.from(node.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child.hasAttribute("data-tabs-root")) return;
      markOwnedTree(child, ownerId);
  });
}

function initializeOwnedNodes(root) {
  const ownerId = tabsOwnerId(root);
  descendantNodes(root, "[data-tabs-family]").forEach((node) =>
    markOwnedTree(node, ownerId),
  );
}

function ownedNodes(root, selector) {
  const ownerId = tabsOwnerId(root);
  const nodes = ownedNodesByOwner.get(ownerId);
  if (!nodes) return [];
  return Array.from(nodes).filter((node) => {
      if (!node.isConnected) {
        nodes.delete(node);
        return false;
      }
      return (
        node instanceof HTMLElement &&
          node.matches(selector) &&
          toString(node.getAttribute("data-tabs-owner")) === ownerId
      );
  });
}

export {
  initializeOwnedNodes,
  ownedNodes,
};
