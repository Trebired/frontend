type ServerGraphRoot = {
  render(props: Record<string, unknown>): void;
  resize?(): void;
};

function takeLastItems<T>(items: T[] | null | undefined, limitInput: unknown): T[] {
  const limit = Number(limitInput);
  const values = Array.isArray(items) ? items : [];
  if (!Number.isInteger(limit) || limit <= 0) return values.slice();
  return values.slice(-limit);
}

function numericPointValues(pointsInput: unknown): number[] {
  return (Array.isArray(pointsInput) ? pointsInput : [])
  .map((point: any) =>
    Number(point && typeof point === "object" ? point.value : point),
  )
  .filter(Number.isFinite);
}

function averagePointValue(pointsInput: unknown): number | null {
  const values = numericPointValues(pointsInput);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function peakPointValue(pointsInput: unknown): number | null {
  const values = numericPointValues(pointsInput);
  if (!values.length) return null;
  return Math.max(...values);
}

function graphRightDetails(roofInput: unknown): number[] {
  const roof = Number(roofInput);
  const maxValue = Number.isFinite(roof) && roof > 0 ? roof : 0;
  const step = maxValue / 4;
  return [
    maxValue,
    maxValue - step,
    maxValue - step * 2,
    maxValue - step * 3,
    0,
  ];
}

function resolveGraphRoof(pointsInput: unknown): number {
  const values = numericPointValues(pointsInput);
  if (!values.length) return 1;
  const maxValue = Math.max(...values);
  if (!Number.isFinite(maxValue) || maxValue <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  return Math.ceil(maxValue / magnitude) * magnitude;
}

function graphRightDetailsForPoints(pointsInput: unknown): number[] {
  return graphRightDetails(resolveGraphRoof(pointsInput));
}

function percentGraphRightDetails(): number[] {
  return graphRightDetails(100);
}

function serverGraphBottomDetails(_points?: unknown[]): string[] {
  return ["10m ago", "5m ago", "now"];
}

function formatServerGraphRecordedAt(value: unknown): string {
  const text = String(value || "").trim();
  if (!text) return "unknown";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text || "unknown";
  return date.toLocaleString(document.documentElement.lang || undefined);
}

function setServerGraphLoading(
  target: ServerGraphRoot | null | undefined,
  loading: boolean,
): void {
  if (!target || typeof target.render !== "function") return;
  target.render({
      loading: loading === true,
      ...(loading === true
        ? {
          state: "ok",
          stateTone: "",
          description: "",
        }
        : {}),
  });
}

function setServerGraphUnavailable(
  target: ServerGraphRoot | null | undefined,
  message: string,
): void {
  if (!target || typeof target.render !== "function") return;
  target.render({
      loading: false,
      state: "warning",
      stateTone: "warn",
      description: message,
  });
}

function setServerGraphsLoading(
  targets: Array<ServerGraphRoot | null | undefined>,
  loading: boolean,
): void {
  (Array.isArray(targets) ? targets : []).forEach((target) => {
      setServerGraphLoading(target, loading);
  });
}

function setServerGraphsUnavailable(
  targets: Array<ServerGraphRoot | null | undefined>,
  message: string,
): void {
  (Array.isArray(targets) ? targets : []).forEach((target) => {
      setServerGraphUnavailable(target, message);
  });
}

export {
  averagePointValue,
  formatServerGraphRecordedAt,
  graphRightDetails,
  graphRightDetailsForPoints,
  numericPointValues,
  peakPointValue,
  percentGraphRightDetails,
  serverGraphBottomDetails,
  setServerGraphLoading,
  setServerGraphUnavailable,
  setServerGraphsLoading,
  setServerGraphsUnavailable,
  takeLastItems,
  takeLastItems as takeLastServerGraphItems,
};
export type { ServerGraphRoot };
