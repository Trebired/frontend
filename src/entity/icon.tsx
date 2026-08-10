import type { HTMLAttributes } from "react";
import { Icon } from "#lbkpzw8nphru";
import { toText as text } from "#ndsvdqv80epr";

type EntityIconProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  alt?: string;
  defaultSize?: string;
  iconClassName?: string;
  size?: string;
  spec: string;
};

type EntityIconConfig = {
  defaultSize?: string;
  label?: string;
  spec: string;
};

function EntityIcon(props: EntityIconProps) {
  const {
    alt,
    className,
    defaultSize = "xl3",
    iconClassName,
    size,
    spec,
    ...attrs
  } = props;
  const altText = text(alt);
  const sizeClass = text(size, defaultSize);
  const wrapperClassName = [`text-${sizeClass}`, className]
  .filter(Boolean)
  .join(" ");

  return (
    <div
    {...attrs}
    className={wrapperClassName}
    aria-hidden={altText ? undefined : true}
    aria-label={altText || undefined}
    >
    <Icon spec={spec} className={iconClassName} />
    </div>
  );
}

function createEntityIcon(config: EntityIconConfig) {
  return function ConfiguredEntityIcon(
    props: Omit<EntityIconProps, "defaultSize" | "spec"> = {},
  ) {
    return (
      <EntityIcon
      {...props}
      alt={text(props.alt, config.label)}
      defaultSize={config.defaultSize}
      spec={config.spec}
      />
    );
  };
}

export { createEntityIcon, EntityIcon };
export type { EntityIconConfig, EntityIconProps };
