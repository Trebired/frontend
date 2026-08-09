import type {
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import {
  AppHeader,
  HeaderGroup,
  MobileNav,
  MobileNavCloseButton,
  MobileNavToggleButton,
  type AppHeaderProps,
  type MobileNavProps,
} from "#beon2qdcbsoe";

type ShellHeaderProps = Omit<AppHeaderProps, "brand"> & {
  brandClassName?: string;
  brandContent?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  brandMeta?: ReactNode;
  mobileToggle?: boolean;
  mobileToggleClassName?: string;
  mobileToggleControls?: string;
  mobileToggleIcon?: ReactNode;
  mobileToggleLabel?: string;
};

type ShellHeaderBrandProps = {
  brandContent?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  brandMeta?: ReactNode;
  className?: string;
};

type ShellHeaderMobileToggleProps = {
  className?: string;
  controls?: string;
  icon?: ReactNode;
  label?: string;
};

type ShellMobileNavSectionProps = Omit<HTMLAttributes<HTMLElement>, "content"> & {
  content?: ReactNode;
  hidden?: boolean;
  label?: ReactNode;
  labelClassName?: string;
};

type ShellMobileNavProps = Omit<MobileNavProps, "children"> & {
  children?: ReactNode;
  closeIcon?: ReactNode;
  closeLabel?: string;
  contentClassName?: string;
  sections?: ShellMobileNavSectionProps[];
  title?: ReactNode;
  titleClassName?: string;
};

function ShellHeaderBrand(props: ShellHeaderBrandProps) {
  const { brandContent, brandHref, brandLabel, brandMeta, className } = props;
  if (!brandContent && !brandMeta) return null;
  return (
    <HeaderGroup className={classNames("tbf-shell-header-brand", className)}>
      {brandHref ? (
        <a
          aria-label={brandLabel}
          className="tbf-shell-header-brand__link"
          href={brandHref}
        >
          {brandContent}
        </a>
      ) : (
        <span className="tbf-shell-header-brand__mark">{brandContent}</span>
      )}
      {brandMeta ? (
        <span className="tbf-shell-header-brand__meta">{brandMeta}</span>
      ) : null}
    </HeaderGroup>
  );
}

function ShellHeaderMobileToggle(props: ShellHeaderMobileToggleProps) {
  const {
    className,
    controls = "mobile_nav_shell",
    icon,
    label = "Open navigation menu",
  } = props;
  return (
    <HeaderGroup className="tbf-shell-header-toggle-group">
      <MobileNavToggleButton
        aria-label={label}
        className={classNames("tbf-shell-header-toggle", className)}
        controls={controls}
      >
        {icon ?? label}
      </MobileNavToggleButton>
    </HeaderGroup>
  );
}

function shellHeaderBrand(props: ShellHeaderProps) {
  return (
    <>
      <ShellHeaderBrand
        brandContent={props.brandContent}
        brandHref={props.brandHref}
        brandLabel={props.brandLabel}
        brandMeta={props.brandMeta}
        className={props.brandClassName}
      />
      {props.mobileToggle ? (
        <ShellHeaderMobileToggle
          className={props.mobileToggleClassName}
          controls={props.mobileToggleControls}
          icon={props.mobileToggleIcon}
          label={props.mobileToggleLabel}
        />
      ) : null}
    </>
  );
}

function ShellHeader(props: ShellHeaderProps) {
  const {
    brandClassName,
    brandContent,
    brandHref,
    brandLabel,
    brandMeta,
    className,
    mobileToggle,
    mobileToggleClassName,
    mobileToggleControls,
    mobileToggleIcon,
    mobileToggleLabel,
    ...rest
  } = props;
  return (
    <AppHeader
      {...rest}
      brand={shellHeaderBrand({
        brandClassName,
        brandContent,
        brandHref,
        brandLabel,
        brandMeta,
        mobileToggle,
        mobileToggleClassName,
        mobileToggleControls,
        mobileToggleIcon,
        mobileToggleLabel,
      })}
      className={classNames("tbf-shell-header", className)}
      data-tbf-shell-header=""
    />
  );
}

function ShellMobileNavSection(props: ShellMobileNavSectionProps) {
  const { children, className, content, hidden, label, labelClassName, ...rest } = props;
  const body = content ?? children;
  if (hidden || body === null || body === undefined || body === false) return null;
  return (
    <section
      {...rest}
      className={classNames("tbf-shell-mobile-nav__section", className)}
    >
      {label ? (
        <div className={classNames("tbf-shell-mobile-nav__section-label", labelClassName)}>
          {label}
        </div>
      ) : null}
      {body}
    </section>
  );
}

function shellMobileNavSections(sections: ShellMobileNavSectionProps[] | undefined) {
  if (!Array.isArray(sections)) return null;
  return sections.map((section, index) => (
    <ShellMobileNavSection
      {...section}
      key={section.id || `shell_mobile_nav_section_${index}`}
    />
  ));
}

function ShellMobileNav(props: ShellMobileNavProps) {
  const {
    children,
    className,
    closeIcon,
    closeLabel = "Close navigation menu",
    contentClassName,
    panelLabel,
    sections,
    title = "Menu",
    titleClassName,
    ...rest
  } = props;
  return (
    <MobileNav
      {...rest}
      className={classNames("tbf-shell-mobile-nav-shell", className)}
      panelLabel={panelLabel || String(title || "Menu")}
    >
      <div className={classNames("tbf-shell-mobile-nav", contentClassName)}>
        <div className="tbf-shell-mobile-nav__head">
          <span className={classNames("tbf-shell-mobile-nav__title", titleClassName)}>
            {title}
          </span>
          <MobileNavCloseButton
            aria-label={closeLabel}
            className="tbf-shell-mobile-nav__close"
          >
            {closeIcon ?? closeLabel}
          </MobileNavCloseButton>
        </div>
        {children}
        {shellMobileNavSections(sections)}
      </div>
    </MobileNav>
  );
}

export {
  ShellHeader,
  ShellHeaderBrand,
  ShellHeaderMobileToggle,
  ShellMobileNav,
  ShellMobileNavSection,
};
export * from "./links.js";
export * from "./product/index.js";
export * from "./state.js";
export type {
  ShellHeaderBrandProps,
  ShellHeaderMobileToggleProps,
  ShellHeaderProps,
  ShellMobileNavProps,
  ShellMobileNavSectionProps,
};
