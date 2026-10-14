const ROW_SELECTOR = '[role="treeitem"]';

function treeRows(tree: HTMLElement): HTMLElement[] {
  return Array.from(tree.querySelectorAll<HTMLElement>(ROW_SELECTOR));
}

function focusRow(rows: HTMLElement[], index: number): void {
  const target = rows[Math.min(Math.max(index, 0), rows.length - 1)];
  if (!target) return;
  for (const row of rows) row.tabIndex = row === target ? 0 : -1;
  target.focus();
}

function currentIndex(rows: HTMLElement[]): number {
  const active = document.activeElement;
  return rows.findIndex((row) => row === active || row.contains(active));
}

function parentIndex(rows: HTMLElement[], index: number): number {
  const level = Number(rows[index]?.getAttribute("aria-level") || 1);
  for (let step = index - 1; step >= 0; step -= 1) {
    if (Number(rows[step]?.getAttribute("aria-level") || 1) < level) return step;
  }
  return index;
}

function stepFor(key: string, rows: HTMLElement[], index: number): number | null {
  if (key === "ArrowDown") return index + 1;
  if (key === "ArrowUp") return index - 1;
  if (key === "Home") return 0;
  if (key === "End") return rows.length - 1;
  if (key === "ArrowLeft") return parentIndex(rows, index);
  return null;
}

function expandOrEnter(rows: HTMLElement[], index: number): boolean {
  const row = rows[index];
  if (!row) return false;
  if (row.getAttribute("aria-expanded") === "false") {
    row.click();
    return true;
  }
  if (row.getAttribute("aria-expanded") === "true") {
    focusRow(rows, index + 1);
    return true;
  }
  return false;
}

function collapseOrLeave(rows: HTMLElement[], index: number): boolean {
  const row = rows[index];
  if (row?.getAttribute("aria-expanded") === "true") {
    row.click();
    return true;
  }
  focusRow(rows, parentIndex(rows, index));
  return true;
}

function handleTreeKeyDown(event: {
    currentTarget: unknown;
    key: string;
    preventDefault: () => void;
    target: unknown;
}): void {
  const tree = event.currentTarget;
  if (!(tree instanceof HTMLElement)) return;
  const rows = treeRows(tree);
  if (!rows.length) return;
  const index = Math.max(currentIndex(rows), 0);
  if (event.key === "ArrowRight") {
    if (expandOrEnter(rows, index)) event.preventDefault();
    return;
  }
  if (event.key === "ArrowLeft") {
    if (collapseOrLeave(rows, index)) event.preventDefault();
    return;
  }
  const next = stepFor(event.key, rows, index);
  if (next === null) return;
  event.preventDefault();
  focusRow(rows, next);
}

function handleTreeFocus(event: { currentTarget: unknown; target: unknown }): void {
  const tree = event.currentTarget;
  if (!(tree instanceof HTMLElement) || event.target !== tree) return;
  const rows = treeRows(tree);
  const active = rows.findIndex((row) => row.tabIndex === 0);
  focusRow(rows, active >= 0 ? active : 0);
}

export { focusRow, handleTreeFocus, handleTreeKeyDown, treeRows };
