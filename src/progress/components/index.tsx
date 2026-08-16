import type { HTMLAttributes } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
  const { active, className, id = `${FRONTEND_PREFIX}_progress`, value = 0, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("progress"), className)}
    {...frontendDataAttrs({ "progress-active": dataBool(active) })}
    id={id}
    aria-hidden="true"
    >
    <span
    className={frontendElementClass("progress", "bar")}
    style={{ transform: `scaleX(${normalizedProgress(value)})` }}
    />
    </div>
  );
}

export { ProgressRoot };
export type { ProgressRootProps };
