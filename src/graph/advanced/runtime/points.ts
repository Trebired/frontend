export type NumericGraphPoint = {
  label: string;
  value: number;
};

export function numericGraphPoint(
  recordedAt: unknown,
  valueInput: unknown,
): NumericGraphPoint | null {
  const value = Number(valueInput);
  if (!Number.isFinite(value)) return null;
  return {
    label: typeof recordedAt === "string" ? recordedAt : "",
    value,
  };
}

export function numericHistoryToPoints(
  history: unknown,
  getValue: (entry: any) => unknown,
): NumericGraphPoint[] {
  return (Array.isArray(history) ? history : [])
  .map((entry) =>
    numericGraphPoint(entry && entry.recorded_at, getValue(entry)),
  )
  .filter(Boolean) as NumericGraphPoint[];
}
