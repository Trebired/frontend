import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import { classNames } from "#ndsvdqv80epr";
import { motifBootSource } from "./../motif/boot.js";
import { motifEntry } from "./../motif/registry.js";

type MotifProps = {
  className?: string;
  variant: string;
};

const block = "motif";

function Motif(props: MotifProps) {
  const { className, variant } = props;
  if (!motifEntry(variant)) return null;

  return (
    <>
    <canvas
    aria-hidden="true"
    className={classNames(frontendClassName(block), className)}
    suppressHydrationWarning
    {...frontendDataAttrs({ motif: variant })}
    />
    <script dangerouslySetInnerHTML={{ __html: motifBootSource(variant) }} suppressHydrationWarning />
    </>
  );
}

export { Motif };
export type { MotifProps };
