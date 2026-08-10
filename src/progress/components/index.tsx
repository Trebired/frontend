import type { HTMLAttributes } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";

type ProgressRootProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  id?: string;
  value?: number;
};

function normalizedProgress(value: number | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function ProgressRoot(props: ProgressRootProps) {
  const { active, className, id = "tbf_progress", value = 0, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames("tbf-progress", className)}
    data-tbf-progress-active={dataBool(active)}
    id={id}
    aria-hidden="true"
    >
    <span
    className="tbf-progress__bar"
    style={{ transform: `scaleX(${normalizedProgress(value)})` }}
    />
    </div>
  );
}

export { ProgressRoot };
export type { ProgressRootProps };
