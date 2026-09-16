let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

function rootReservesScrollbarGutter(root: HTMLElement) {
  try {
    return String(window.getComputedStyle(root).scrollbarGutter || "").includes("stable");
  } catch {
    return false;
  }
}

function compensateScrollbar(root: HTMLElement) {
  const body = document.body;
  previousPaddingRight = body ? body.style.paddingRight : "";
  if (!body || rootReservesScrollbarGutter(root)) return;
  const gap = Math.max(0, window.innerWidth - root.clientWidth);
  if (gap <= 0) return;
  const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight || "0") || 0;
  body.style.paddingRight = `${currentPadding + gap}px`;
}

function applyLock() {
  const root = document.documentElement;
  previousOverflow = root.style.overflow;
  compensateScrollbar(root);
  root.style.overflow = "hidden";
}

function releaseLock() {
  document.documentElement.style.overflow = previousOverflow;
  if (document.body) document.body.style.paddingRight = previousPaddingRight;
}

function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (lockCount === 0) applyLock();
  lockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(lockCount - 1, 0);
    if (lockCount === 0) releaseLock();
  };
}

export { lockBodyScroll };
