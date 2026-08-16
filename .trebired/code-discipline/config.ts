import { defineConfig } from "@trebired/code-discipline";

const PREFIX_PATTERN_ALLOWED_FILES = [
  ".trebired/bundler/config.ts",
  ".trebired/code-discipline/config.ts",
  "package.json",
  "src/namespace/generated.ts",
];

export default defineConfig({
  presets: {
    use: ["@trebired/configs"],
  },
  rules: {
    bannedPatterns: {
      excludeDirs: [{ type: "folder", pattern: "scripts/verify" }],
      patterns: [
        { value: "tbf-", allowedFiles: PREFIX_PATTERN_ALLOWED_FILES },
        { value: "tbf_", allowedFiles: PREFIX_PATTERN_ALLOWED_FILES },
        { value: "tbf:", allowedFiles: PREFIX_PATTERN_ALLOWED_FILES },
        { value: "data-tbf", allowedFiles: PREFIX_PATTERN_ALLOWED_FILES },
        { value: "--tbf", allowedFiles: PREFIX_PATTERN_ALLOWED_FILES },
      ],
    },
  },
});
