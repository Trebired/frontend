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
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type ShellHeaderProps = Omit<AppHeaderProps, "brand"> & {
  brandClassName?: string;
  brandContent?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  brandMeta?: ReactNode;
  brandLogo?: ReactNode;
  brandTag?: ReactNode;
  brandTagAlign?: ShellHeaderBrandTagAlign;
  mobileToggle?: boolean;
  mobileToggleClassName?: string;
  mobileToggleControls?: string;
  mobileToggleIcon?: ReactNode;
  mobileToggleLabel?: string;
};

type ShellHeaderBrandTagAlign = "horizontal" | "vertical";

type ShellHeaderBrandProps = {
  brandContent?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  brandMeta?: ReactNode;
  brandLogo?: ReactNode;
  brandTag?: ReactNode;
  brandTagAlign?: ShellHeaderBrandTagAlign;
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
  const {
    brandContent,
    brandHref,
    brandLabel,
    brandLogo,
    brandMeta,
    brandTag,
    brandTagAlign = "horizontal",
    className,
  } = props;
  const structuredBrand = brandLogo !== undefined || brandTag !== undefined;
  const hasBrandBody = structuredBrand
  ? brandLogo !== undefined || brandTag !== undefined
  : brandContent !== undefined && brandContent !== null && brandContent !== false;
  const brandBody = structuredBrand ? (
    <span
    className={frontendElementClass("shell-header-brand", "identity")}
    {...frontendDataAttrs({ "brand-tag-align": brandTagAlign })}
    >
    {brandLogo ? (
        <span className={frontendElementClass("shell-header-brand", "logo")}>{brandLogo}</span>
      ) : null}
    {brandTag ? (
        <span className={frontendElementClass("shell-header-brand", "tag")}>{brandTag}</span>
      ) : null}
    </span>
  ) : brandContent;
  if (!hasBrandBody && !brandMeta) return null;
  return (
    <HeaderGroup className={classNames(frontendClassName("shell-header-brand"), className)}>
    {brandHref ? (
        <a
        aria-label={brandLabel}
        className={frontendElementClass("shell-header-brand", "link")}
        href={brandHref}
        >
        {brandBody}
        </a>
      ) : (
        <span className={frontendElementClass("shell-header-brand", "mark")}>{brandBody}</span>
    )}
    {!structuredBrand && brandMeta ? (
        <span className={frontendElementClass("shell-header-brand", "meta")}>{brandMeta}</span>
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
    <HeaderGroup className={frontendClassName("shell-header-toggle-group")}>
    <MobileNavToggleButton
    aria-label={label}
    className={classNames(frontendClassName("shell-header-toggle"), className)}
    controls={controls}
    >
    {icon ?? label}
    </MobileNavToggleButton>
    </HeaderGroup>
  );
}

function renderShellHeaderBrand(props: ShellHeaderProps) {
  return (
    <>
    <ShellHeaderBrand
    brandContent={props.brandContent}
    brandHref={props.brandHref}
    brandLabel={props.brandLabel}
    brandLogo={props.brandLogo}
    brandMeta={props.brandMeta}
    brandTag={props.brandTag}
    brandTagAlign={props.brandTagAlign}
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
    brandLogo,
    brandMeta,
    brandTag,
    brandTagAlign,
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
    brand={renderShellHeaderBrand({
          brandClassName,
          brandContent,
          brandHref,
          brandLabel,
          brandLogo,
          brandMeta,
          brandTag,
          brandTagAlign,
          mobileToggle,
          mobileToggleClassName,
          mobileToggleControls,
          mobileToggleIcon,
          mobileToggleLabel,
    })}
    className={classNames(frontendClassName("shell-header"), className)}
    {...frontendDataAttrs({ "shell-header": "" })}
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
    className={classNames(frontendElementClass("shell-mobile-nav", "section"), className)}
    >
    {label ? (
        <div className={classNames(frontendElementClass("shell-mobile-nav", "section-label"), labelClassName)}>
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
    className={classNames(frontendClassName("shell-mobile-nav-shell"), className)}
    panelLabel={panelLabel || String(title || "Menu")}
    >
    <div className={classNames(frontendClassName("shell-mobile-nav"), contentClassName)}>
    <div className={frontendElementClass("shell-mobile-nav", "head")}>
    <span className={classNames(frontendElementClass("shell-mobile-nav", "title"), titleClassName)}>
    {title}
    </span>
    <MobileNavCloseButton
    aria-label={closeLabel}
    className={frontendElementClass("shell-mobile-nav", "close")}
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
  ShellHeaderBrandTagAlign,
  ShellHeaderProps,
  ShellMobileNavProps,
  ShellMobileNavSectionProps,
};
