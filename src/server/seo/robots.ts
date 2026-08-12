import { serverObject } from "#hf241ii8z71i";
import { firstSeoText } from "./text.js";
import type { SeoConfig, SeoRobotsConfig } from "./types.js";

const ROBOTS_NOINDEX_CONTENT = "noindex, nofollow, noarchive";

function robotsTokensFromObject(input: SeoRobotsConfig) {
  const tokens: string[] = [];
  if (typeof input.index === "boolean") tokens.push(input.index ? "index" : "noindex");
  if (typeof input.follow === "boolean") tokens.push(input.follow ? "follow" : "nofollow");
  if (typeof input.archive === "boolean") tokens.push(input.archive ? "archive" : "noarchive");
  if (typeof input.snippet === "boolean" && !input.snippet) tokens.push("nosnippet");
  if (typeof input.imageIndex === "boolean" && !input.imageIndex) tokens.push("noimageindex");
  if (typeof input.translate === "boolean" && !input.translate) tokens.push("notranslate");
  if (input.nocache === true) tokens.push("nocache");
  if (input.maxSnippet != null) {
    tokens.push(`max-snippet:${Math.max(-1, Number(input.maxSnippet) || 0)}`);
  }
  if (input.maxVideoPreview != null) {
    tokens.push(`max-video-preview:${Math.max(-1, Number(input.maxVideoPreview) || 0)}`);
  }
  const imagePreview = firstSeoText(input.maxImagePreview, input.imagePreview);
  if (imagePreview) tokens.push(`max-image-preview:${imagePreview}`);
  if (input.unavailableAfter) tokens.push(`unavailable_after:${input.unavailableAfter}`);
  return tokens;
}

function robotsRuleContent(input: unknown) {
  if (typeof input === "string") return input.trim();
  if (Array.isArray(input)) return input.map(firstSeoText).filter(Boolean).join(", ");
  return robotsTokensFromObject(serverObject(input) as SeoRobotsConfig).join(", ");
}

function robotsContent(config: SeoConfig = {}) {
  const explicit = firstSeoText(config.robotsContent);
  if (explicit) return explicit;
  const rules = robotsRuleContent(config.robots);
  if (rules) return rules;
  return config.index === true ? "index, follow" : ROBOTS_NOINDEX_CONTENT;
}

function botRobotsContent(config: SeoConfig, key: "bingbot" | "googlebot") {
  const explicit = firstSeoText(config[`${key}Content`as keyof SeoConfig]);
  if (explicit) return explicit;
  return robotsRuleContent(config[key]) || robotsContent(config);
}

export {
  ROBOTS_NOINDEX_CONTENT,
  botRobotsContent,
  robotsContent,
  robotsRuleContent,
  robotsTokensFromObject,
};
