import { joinClassNames } from "#dqy2d22qyujv";
import type { CSSProperties, ReactNode, Ref } from "react";
import { frontendClassName, frontendClassNames } from "#5vbaqj4pirp3";

type FileTreeShellProps = {
  children?: ReactNode;
  hostRef?: Ref<HTMLDivElement>;
  scrollbarSize?: string;
  scrollbarWidth?: number;
  style?: CSSProperties;
};

function FileTreeShell(props: FileTreeShellProps) {
  return (
    <div
    ref={props.hostRef}
    className={joinClassNames(
        frontendClassNames("card", "column", "gap-xs", "overflow-hidden", "file-tree-shell"),
        frontendClassName(`scroll-min-${props.scrollbarSize || "sm"}`),
    )}
    style={{
        "--scroll-min-size": `${Math.max(0, Number(props.scrollbarWidth) || 6)}px`,
        ...(props.style || {}),
      } as CSSProperties}
    >
    {props.children}
    </div>
  );
}

export { FileTreeShell };
export type { FileTreeShellProps };
