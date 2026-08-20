const logsPartialPages = new WeakMap<HTMLElement, any>();

function readLogsPartialPage(root: HTMLElement | null) {
  return root instanceof HTMLElement
  ? logsPartialPages.get(root) || null
  : null;
}

function setLogsPartialPage(root: HTMLElement, page: any) {
  logsPartialPages.set(root, page);
}

function deleteLogsPartialPage(root: HTMLElement) {
  logsPartialPages.delete(root);
}

export { deleteLogsPartialPage, readLogsPartialPage, setLogsPartialPage };
