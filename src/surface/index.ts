type SurfaceTone = "default" | "muted" | "strong" | string;

type SurfaceSize = "sm" | "md" | "lg" | string;

function surfaceClass(
  base: string,
  options: { size?: SurfaceSize; tone?: SurfaceTone; variant?: string } = {},
) {
  return [
    base,
    options.size ? `${base}--${options.size}` : "",
    options.tone ? `${base}--${options.tone}` : "",
    options.variant ? `${base}--${options.variant}` : "",
  ].filter(Boolean).join(" ");
}

export { surfaceClass };
export type { SurfaceSize, SurfaceTone };
