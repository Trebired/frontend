function touchOnly(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(hover: none)").matches);
}

export { touchOnly };
