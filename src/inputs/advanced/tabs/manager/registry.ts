const tabRoots = new Set<HTMLElement>();

function registerTabRoot(root: HTMLElement) {
  tabRoots.add(root);
}

function registeredTabRoots() {
  return Array.from(tabRoots).filter((root) => {
      if (root.isConnected) return true;
      tabRoots.delete(root);
      return false;
  });
}

export { registeredTabRoots, registerTabRoot };
