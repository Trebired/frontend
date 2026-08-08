import type { CSSProperties, ReactNode, Ref } from "react";

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
      className={`card column gap-xs overflow-hidden tbf-file-tree-shell scroll-min-${props.scrollbarSize || "sm"}`}
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
