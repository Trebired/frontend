import { text } from "#kv9urtb9dbq5";

function normalizeColor(value: unknown) {
  const raw = text(value);
  if (!raw || raw === "none" || raw === "transparent" || raw === "currentColor") {
    return "";
  }
  if (/^#[0-9a-f]{6}$/iu.test(raw)) return raw;
  if (/^#[0-9a-f]{3}$/iu.test(raw)) {
    return `#${raw.slice(1).split("").map((char) => char + char).join("")}`;
  }
  return parseRgbColor(raw);
}

function parseRgbColor(raw: string) {
  const rgbMatch = raw.match(/^rgba?\(([^)]+)\)$/iu);
if (!rgbMatch) return "";
const parts = text(rgbMatch[1])
.split(",")
.map((part) => Number(text(part)))
.slice(0, 3);
if (
  parts.length !== 3 ||
    parts.some((part) => !Number.isFinite(part) || part < 0 || part > 255)
) {
  return "";
}
return `#${parts.map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function collectSvgColors(svg: Element) {
  const counts = new Map<string, number>();
  const register = (value: unknown) => {
    const color = normalizeColor(value);
    if (!color) return;
    counts.set(color, (counts.get(color) || 0) + 1);
  };
  register(svg.getAttribute("fill"));
  register(svg.getAttribute("stroke"));
  svg.querySelectorAll("[fill], [stroke]").forEach((node) => {
      register(node.getAttribute("fill"));
      register(node.getAttribute("stroke"));
  });
  return counts;
}

function deriveColorFromIcon(row: HTMLElement) {
  const svg = row.querySelector("[data-tbf-source-language-icon] svg");
  if (!svg) return "";
  let winner = "";
  let winnerCount = -1;
  collectSvgColors(svg).forEach((count, color) => {
      if (count <= winnerCount) return;
      winner = color;
      winnerCount = count;
  });
  return winner;
}

export { deriveColorFromIcon, normalizeColor };
