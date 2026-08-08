type SurfaceTone = "default" | "muted" | "strong" | string;

type SurfaceSize = "sm" | "md" | "lg" | string;

function surfaceClass(base: string, options: { size?: SurfaceSize; tone?: SurfaceTone } = {}) {
  return [
    base,
    options.size ? `${base}--${options.size}` : "",
    options.tone ? `${base}--${options.tone}` : "",
  ].filter(Boolean).join(" ");
}

export { surfaceClass };
export type { SurfaceSize, SurfaceTone };
