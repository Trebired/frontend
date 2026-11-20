import { joinClassNames } from "#dqy2d22qyujv";
import type { CSSProperties, ReactNode, Ref } from "react";
import { frontendClassName, frontendDataAttrs, frontendClassNames, frontendCssVar } from "#5vbaqj4pirp3";
import { fileTreeDropAttrs } from "./drag.js";

type FileTreeShellProps = {
  children?: ReactNode;
  dropRoot?: boolean;
  dropTarget?: boolean;
  hostRef?: Ref<HTMLDivElement>;
  scrollbarSize?: string;
  scrollbarWidth?: number;
  style?: CSSProperties;
};

function FileTreeShell(props: FileTreeShellProps) {
  return (
    <div
    ref={props.hostRef}
    {...(props.dropRoot ? fileTreeDropAttrs("") : {})}
    {...frontendDataAttrs({ container: "card" })}
    className={joinClassNames(
        frontendClassNames("column", "gap-xs", "overflow-hidden", "file-tree-shell"),
        frontendClassName(`scroll-min-${props.scrollbarSize || "sm"}`),
    )}
    style={{
        "--scroll-min-size": `${Math.max(0, Number(props.scrollbarWidth) || 6)}px`,
        ...(props.dropTarget ? { boxShadow: `inset 0 0 0 calc(var(--border-width, 1px) * 2) var(${frontendCssVar("focus")}, currentColor)` } : {}),
        ...(props.style || {}),
      } as CSSProperties}
    >
    {props.children}
    </div>
  );
}

export { FileTreeShell };
export type { FileTreeShellProps };
