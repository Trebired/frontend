import { Icon } from "#lbkpzw8nphru";

type FileTreeRowModel = {
  fileCount: number;
  highlighted: boolean;
  iconSpec: string;
  isOpen: boolean;
  kind: string;
  name: string;
};

function fileTreeLeftBorderColor(model: Pick<FileTreeRowModel, "highlighted">) {
  return model.highlighted ? "var(--gray-400)" : "var(--border-surface-1)";
}

function FileTreeToggle(props: { isDir: boolean; isOpen: boolean }) {
  return (
    <span
      className="inline-row no-shrink ver-center"
      style={{ width: 14, fontSize: 11, opacity: props.isDir ? 0.9 : 0.45 }}
    >
      {props.isDir ? (props.isOpen ? "v" : ">") : ""}
    </span>
  );
}

function FileTreeIcon(props: Pick<FileTreeRowModel, "highlighted" | "iconSpec">) {
  return (
    <span
      className="inline-row no-shrink ver-center"
      style={{ width: 30, fontSize: 15, opacity: props.highlighted ? 1 : 0.8 }}
    >
      {props.iconSpec ? (
        <Icon spec={props.iconSpec} className="icon" />
      ) : (
        <span className="icon" aria-hidden="true" />
      )}
    </span>
  );
}

function FileTreeName(props: Pick<FileTreeRowModel, "name">) {
  return (
    <span
      className="text-break"
      style={{
        flex: "1 1 auto",
        fontSize: 13,
        lineHeight: 1.2,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {props.name}
    </span>
  );
}

function FileTreeCount(props: Pick<FileTreeRowModel, "fileCount" | "kind">) {
  if (props.kind !== "dir") return null;
  return (
    <span className="text-muted no-shrink" style={{ fontSize: 12, lineHeight: 1.2, opacity: 0.9 }}>
      {props.fileCount}
    </span>
  );
}

export {
  FileTreeCount,
  FileTreeIcon,
  FileTreeName,
  FileTreeToggle,
  fileTreeLeftBorderColor,
};
export type { FileTreeRowModel };
