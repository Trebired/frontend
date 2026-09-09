const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
  .filter((node) => node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement);
}

function trapTabKey(root: HTMLElement, event: KeyboardEvent): void {
  const focusable = focusableWithin(root);
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
    return;
  }
  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault();
    last.focus();
  }
}

function captureFocus(root: HTMLElement): () => void {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const focusable = focusableWithin(root);
  (focusable[0] ?? root).focus();

  return () => {
    previous?.focus();
  };
}

export { captureFocus, focusableWithin, trapTabKey };
