type LayoutChromeInput = {
  bottomBar?: unknown;
  header?: unknown;
  leftSidebar?: unknown;
  mobileNav?: unknown;
  rightSidebar?: unknown;
  secondaryHeader?: unknown;
};

type LayoutChromeState = {
  hasBottomBar: boolean;
  hasHeader: boolean;
  hasLeftSidebar: boolean;
  hasMobileNav: boolean;
  hasRightSidebar: boolean;
  hasSecondaryHeader: boolean;
  mobile: boolean;
};

function hasValue(value: unknown) {
  return value !== false && value !== null && value !== undefined;
}

function resolveLayoutChromeState(input: LayoutChromeInput = {}): LayoutChromeState {
  const hasBottomBar = hasValue(input.bottomBar);
  const hasMobileNav = hasValue(input.mobileNav) || hasBottomBar;
  return {
    hasBottomBar,
    hasHeader: hasValue(input.header),
    hasLeftSidebar: hasValue(input.leftSidebar),
    hasMobileNav,
    hasRightSidebar: hasValue(input.rightSidebar),
    hasSecondaryHeader: hasValue(input.secondaryHeader),
    mobile: hasMobileNav || hasBottomBar,
  };
}

export { resolveLayoutChromeState };
export type { LayoutChromeInput, LayoutChromeState };
