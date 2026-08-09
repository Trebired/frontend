import { classNames } from "#ndsvdqv80epr";
import {
  AppHeader,
  HeaderGroup,
  MobileNavToggleButton,
} from "#beon2qdcbsoe";
import { productShellLabel, readProductShellState } from "./state.js";
import type { ProductShellHeaderProps } from "./types.js";

function headerBrand(props: ProductShellHeaderProps) {
  if (!props.brandContent && !props.brandMeta) return null;
  return (
    <HeaderGroup className={classNames("tbf-shell-header-brand", props.brandClassName)}>
      {props.brandHref ? (
        <a
          aria-label={productShellLabel(props.labels, "goHome")}
          className="tbf-shell-header-brand__link"
          href={props.brandHref}
        >
          {props.brandContent}
        </a>
      ) : (
        <span className="tbf-shell-header-brand__mark">
          {props.brandContent}
        </span>
      )}
      {props.brandMeta ? (
        <span className="tbf-shell-header-brand__meta">
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
    <HeaderGroup className="tbf-shell-header-toggle-group">
      <MobileNavToggleButton
        aria-label={label}
        className={classNames("tbf-shell-header-toggle", props.mobileToggleClassName)}
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
        className={classNames("tbf-shell-header", props.className)}
        data-tbf-shell-header=""
        id={props.id || "primary_header"}
        nav={state.chrome.showHeaderLinks ? props.nav : null}
      />
      {props.overlays}
    </>
  );
}

export { ProductShellHeader };
