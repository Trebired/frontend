import type { HTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type LayerRootProps = HTMLAttributes<HTMLDivElement> & {
  id?: string;
};

type PortalElementProps = HTMLAttributes<HTMLDivElement> & {
  z?: number | string;
};

function LayerRoot(props: LayerRootProps) {
  const { children, className, id = `${FRONTEND_PREFIX}_layer_root`, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("layer-root"), className)}
    {...frontendDataAttrs({ "layer-root": "" })}
    id={id}
    >
    {children}
    </div>
  );
}

function PortalElement(props: PortalElementProps) {
  const { children, className, z, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("portal"), className)}
    {...frontendDataAttrs({ "portal": "" })}
    {...frontendDataAttrs({ "z": z })}
    >
    {children}
    </div>
  );
}

export { LayerRoot, PortalElement };
export type { LayerRootProps, PortalElementProps };
