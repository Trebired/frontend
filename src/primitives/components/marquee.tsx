import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type MarqueeProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  items: ReactNode[];
  paused?: boolean;
  repeat?: number;
  separator?: ReactNode;
};

const block = "marquee";

function marqueeItems(items: ReactNode[], repeat: number) {
  const passes = Number.isFinite(repeat) && repeat > 0 ? Math.floor(repeat) : 2;
  const out: Array<{ key: string; node: ReactNode }> = [];
  for (let pass = 0; pass < passes; pass += 1) {
    items.forEach((node, index) => {
        out.push({ key: `${pass}-${index}`, node });
    });
  }
  return out;
}

function Marquee(props: MarqueeProps) {
  const { className, items, paused, repeat = 2, separator = "✦", ...rest } = props;

  return (
    <section
    {...rest}
    className={classNames(frontendClassName(block), className)}
    {...frontendDataAttrs({ "marquee": "" })}
    {...frontendDataAttrs({ "marquee-paused": paused ? "true" : undefined })}
    >
    <div className={frontendElementClass(block, "track")}>
    {marqueeItems(items, repeat).map((entry) => (
          <div className={frontendElementClass(block, "item")} key={entry.key}>
          <span className={frontendElementClass(block, "content")}>{entry.node}</span>
          {separator ? (
              <span aria-hidden="true" className={frontendElementClass(block, "separator")}>
              {separator}
              </span>
            ) : null}
          </div>
    ))}
    </div>
    </section>
  );
}

export { Marquee };
export type { MarqueeProps };
