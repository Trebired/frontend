import type { ScriptHTMLAttributes } from "react";
import { toString } from "#21h9o6s9g3d1";
import { frontendEventName } from "#5vbaqj4pirp3";

type FallbackTitleBootScriptProps =
Omit<ScriptHTMLAttributes<HTMLScriptElement>, "children" | "dangerouslySetInnerHTML"> & {
  eventName?: string;
  title?: unknown;
  titleSuffix?: unknown;
};

type FallbackTitleBootScriptOptions = Pick<
FallbackTitleBootScriptProps,
"eventName" | "title" | "titleSuffix"
>;

function createFallbackTitleBootScript(
  options: FallbackTitleBootScriptOptions = {},
) {
  const hasServerTitle = Boolean(toString(options.title));
  const eventName = toString(
    options.eventName,
    frontendEventName("live-navigation"),
  );
  const suffix = toString(options.titleSuffix);
  return [
    "(function() {",
    `  const hasServerTitle = ${JSON.stringify(hasServerTitle)};`,
    "  if (hasServerTitle) return;",
    `  const suffix = ${JSON.stringify(suffix)};`,
    "  function humanize(segment) {",
    "    return segment",
    "      .replace(/-/g, ' ')",
    "      .split(' ')",
    "      .map(function(word) {",
    "        return /^[a-z]/.test(word)",
    "          ? word.charAt(0).toUpperCase() + word.slice(1)",
    "          : word;",
    "      })",
    "      .join(' ');",
    "  }",
    "  function updateTitle() {",
    "    const segments = location.pathname.split('/').filter(Boolean);",
    "    if (segments.length === 0) return;",
    "    const lastSegment = segments[segments.length - 1];",
    "    document.title = humanize(lastSegment) + suffix;",
    "  }",
    `  document.addEventListener(${JSON.stringify(eventName)}, updateTitle);`,
    "  window.addEventListener('popstate', updateTitle);",
    "  updateTitle();",
    "})();",
  ].join("\n");
}

function FallbackTitleBootScript(props: FallbackTitleBootScriptProps) {
  const { eventName, title, titleSuffix, ...rest } = props;
  return (
    <script
    {...rest}
    dangerouslySetInnerHTML={{
        __html: createFallbackTitleBootScript({ eventName, title, titleSuffix }),
    }}
    />
  );
}

export { createFallbackTitleBootScript, FallbackTitleBootScript };
export type { FallbackTitleBootScriptOptions, FallbackTitleBootScriptProps };
