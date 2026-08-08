export type GraphUnitScale = "k" | "m" | "g";

export interface GraphUnitFamily {
  key: string;
  selectable: boolean;
  labels: Record<GraphUnitScale, string>;
  base: number;
  defaultScale: GraphUnitScale;
  fixedLabel: string;
}

const SCALE_ORDER: GraphUnitScale[] = ["k", "m", "g"];
const TYPE_UNIT_ALIASES: Record<string, string> = Object.freeze({
    "network-download": "network",
    "network-upload": "network",
    "storage-read": "storage",
    "storage-write": "storage",
    "cpu-usage": "percent",
    "memory-usage": "percent",
    "gpu-usage": "percent",
});

const FAMILIES: Record<string, GraphUnitFamily> = Object.freeze({
    network: {
      key: "network",
      selectable: true,
      labels: { k: "Kb/s", m: "Mb/s", g: "Gb/s" },
      base: 1000,
      defaultScale: "m",
      fixedLabel: "Mb/s",
    },
    storage: {
      key: "storage",
      selectable: true,
      labels: { k: "KB/s", m: "MB/s", g: "GB/s" },
      base: 1024,
      defaultScale: "m",
      fixedLabel: "MB/s",
    },
    percent: {
      key: "percent",
      selectable: false,
      labels: { k: "%", m: "%", g: "%" },
      base: 1,
      defaultScale: "m",
      fixedLabel: "%",
    },
});

function normalizedKind(value: unknown): string {
  const text = String(value == null ? "" : value)
  .trim()
  .toLowerCase();
  if (TYPE_UNIT_ALIASES[text]) return TYPE_UNIT_ALIASES[text];
  if (text === "%") return "percent";
  return text || "plain";
}

export function graphUnitFamily(value: unknown): GraphUnitFamily {
  const key = normalizedKind(value);
  return (
    FAMILIES[key] || {
      key,
      selectable: false,
      labels: {
        k: String(value || ""),
        m: String(value || ""),
        g: String(value || ""),
      },
      base: 1,
      defaultScale: "m",
      fixedLabel: String(value || ""),
    }
  );
}

export function normalizeGraphUnitScale(
  value: unknown,
  fallback: GraphUnitScale = "m",
): GraphUnitScale {
  const text = String(value == null ? "" : value)
  .trim()
  .toLowerCase();
  return SCALE_ORDER.includes(text as GraphUnitScale)
  ? (text as GraphUnitScale)
  : fallback;
}

export function graphUnitOptions(value: unknown) {
  const family = graphUnitFamily(value);
  return SCALE_ORDER.map((scale) => ({
        scale,
        label: family.labels[scale],
  }));
}

export function graphUnitLabel(value: unknown, scale: unknown = "m"): string {
  const family = graphUnitFamily(value);
  if (!family.selectable) return family.fixedLabel;
  const nextScale = normalizeGraphUnitScale(scale, family.defaultScale);
  return family.labels[nextScale];
}

export function graphUnitFactor(value: unknown, scale: unknown = "m"): number {
  const family = graphUnitFamily(value);
  if (!family.selectable) return 1;
  const nextScale = normalizeGraphUnitScale(scale, family.defaultScale);
  const power = SCALE_ORDER.indexOf(nextScale);
  return Math.pow(family.base, Math.max(0, power));
}

export function convertGraphUnitValue(
  value: unknown,
  unit: unknown,
  scale: unknown = "m",
): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return num / graphUnitFactor(unit, scale);
}

export function formatGraphUnitValue(
  value: unknown,
  unit: unknown,
  scale: unknown = "m",
  precision = 2,
): string {
  const converted = convertGraphUnitValue(value, unit, scale);
  if (!Number.isFinite(converted)) return "unknown";

  const digits = Number.isInteger(precision) && precision >= 0 ? precision : 2;
  const text = Number.isInteger(converted)
  ? String(converted)
  : converted.toFixed(digits).replace(/\.?0+$/, "");
  const label = graphUnitLabel(unit, scale);
  if (!label) return text;
  return label === "%" ? `${text}%` : `${text} ${label}`;
}

export function graphUnitEventName(graphId: unknown): string {
  return `graph-unit-change:${String(graphId || "").trim()}`;
}

export { SCALE_ORDER as graphUnitScales };
