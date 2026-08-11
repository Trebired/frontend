import { serverString } from "#hf241ii8z71i";

function firstSeoText(...values: unknown[]) {
  for (const value of values) {
    const text = serverString(value).trim();
    if (text) return text;
  }
  return "";
}

export { firstSeoText };
