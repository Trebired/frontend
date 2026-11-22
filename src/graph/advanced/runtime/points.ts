export type NumericGraphPoint = {
  label: string;
  peak?: number;
  value: number;
};

export function numericGraphPoint(
  recordedAt: unknown,
  valueInput: unknown,
  peakInput?: unknown,
): NumericGraphPoint | null {
  const value = Number(valueInput);
  if (!Number.isFinite(value)) return null;
  const peak = Number(peakInput);
  return {
    label: typeof recordedAt === "string" ? recordedAt : "",
    ...(peakInput != null && Number.isFinite(peak) ? { peak } : {}),
    value,
  };
}

export function numericHistoryToPoints(
  history: unknown,
  getValue: (entry: any) => unknown,
  getPeak?: (entry: any) => unknown,
): NumericGraphPoint[] {
  return (Array.isArray(history) ? history : [])
  .map((entry) =>
    numericGraphPoint(entry && entry.recorded_at, getValue(entry), getPeak ? getPeak(entry) : undefined),
  )
  .filter(Boolean) as NumericGraphPoint[];
}
