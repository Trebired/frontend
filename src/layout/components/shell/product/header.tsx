import { classNames } from "#ndsvdqv80epr";
import {
  AppHeader,
  HeaderGroup,
  MobileNavToggleButton,
} from "#beon2qdcbsoe";
import { productShellLabel, readProductShellState } from "./state.js";
import type { ProductShellHeaderProps } from "./types.js";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

function headerBrand(props: ProductShellHeaderProps) {
  const structuredBrand = props.brandLogo !== undefined || props.brandTag !== undefined;
  const hasBrandBody = structuredBrand
  ? props.brandLogo !== undefined || props.brandTag !== undefined
  : props.brandContent !== undefined && props.brandContent !== null && props.brandContent !== false;
  if (!hasBrandBody && !props.brandMeta) return null;
  const brandBody = structuredBrand ? (
    <span
    className={frontendElementClass("shell-header-brand", "identity")}
    {...frontendDataAttrs({ "brand-tag-align": props.brandTagAlign || "horizontal" })}
    >
    {props.brandLogo ? (
        <span className={frontendElementClass("shell-header-brand", "logo")}>
        {props.brandLogo}
        </span>
      ) : null}
    {props.brandTag ? (
        <span className={frontendElementClass("shell-header-brand", "tag")}>
        {props.brandTag}
        </span>
      ) : null}
    </span>
  ) : props.brandContent;
  return (
    <HeaderGroup className={classNames(frontendClassName("shell-header-brand"), props.brandClassName)}>
    {props.brandHref ? (
        <a
        aria-label={productShellLabel(props.labels, "goHome")}
        className={frontendElementClass("shell-header-brand", "link")}
        href={props.brandHref}
        >
        {brandBody}
        </a>
      ) : (
        <span className={frontendElementClass("shell-header-brand", "mark")}>
        {brandBody}
        </span>
    )}
    {!structuredBrand && props.brandMeta ? (
        <span className={frontendElementClass("shell-header-brand", "meta")}>
        {props.brandMeta}
        </span>
      ) : null}
    </HeaderGroup>
  );
}

function headerMobileToggle(props: ProductShellHeaderProps) {
  const state = readProductShellState(props.shell);
  if (!state.chrome.showMobileNavToggle) return null;
  const label = productShellLabel(props.labels, "menu");
  return (
    <HeaderGroup className={frontendClassName("shell-header-toggle-group")}>
    <MobileNavToggleButton
    aria-label={label}
    className={classNames(frontendClassName("shell-header-toggle"), props.mobileToggleClassName)}
    controls={props.mobileToggleControls || "mobile_nav_shell"}
    >
    {props.mobileToggleIcon ?? label}
    </MobileNavToggleButton>
    </HeaderGroup>
  );
}

function ProductShellHeader(props: ProductShellHeaderProps) {
  const state = readProductShellState(props.shell);
  return (
    <>
    <AppHeader
    actions={props.actions}
    brand={(
        <>
        {headerBrand(props)}
        {headerMobileToggle(props)}
        </>
    )}
    className={classNames(frontendClassName("shell-header"), props.className)}
    {...frontendDataAttrs({ "shell-header": "" })}
    id={props.id || "primary_header"}
    nav={state.chrome.showHeaderLinks ? props.nav : null}
    />
    {props.overlays}
    </>
  );
}

export { ProductShellHeader };
