import type { HTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";

type LayerRootProps = HTMLAttributes<HTMLDivElement> & {
  id?: string;
};

type PortalElementProps = HTMLAttributes<HTMLDivElement> & {
  z?: number | string;
};

function LayerRoot(props: LayerRootProps) {
  const { children, className, id = "tbf_layer_root", ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-layer-root", className)}
      data-tbf-layer-root=""
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
      className={classNames("tbf-portal", className)}
      data-tbf-portal=""
      data-tbf-z={z}
    >
      {children}
    </div>
  );
}

export { LayerRoot, PortalElement };
export type { LayerRootProps, PortalElementProps };
