import type { FrontendPaletteConfig } from "./types.js";

type FrontendPaletteModes<Palette extends FrontendPaletteConfig> = NonNullable<Palette["modes"]>;
type FrontendPaletteModeKey<Palette extends FrontendPaletteConfig> =
keyof FrontendPaletteModes<Palette> & string;
type FrontendPaletteModeValue<Palette extends FrontendPaletteConfig> =
FrontendPaletteModes<Palette>[FrontendPaletteModeKey<Palette>];
type FrontendPaletteFamily<Palette extends FrontendPaletteConfig> =
keyof FrontendPaletteModeValue<Palette>["scale"] & string;
type FrontendPaletteStep<
Palette extends FrontendPaletteConfig,
Family extends FrontendPaletteFamily<Palette>,
> = Extract<
keyof FrontendPaletteModeValue<Palette>["scale"][Family],
string | number
>;
type FrontendPaletteSemanticToken<Palette extends FrontendPaletteConfig> =
keyof NonNullable<Palette["semantic"]> & string;
type FrontendCssVariable<Name extends string> = `var(--${Name})`;
type FrontendCssVariableWithFallback<Name extends string> = `var(--${Name}, ${string})`;

type FrontendConfigVariableHelper = {
  <Name extends string>(name: Name): FrontendCssVariable<Name>;
  <Name extends string>(name: Name, fallback: string): FrontendCssVariableWithFallback<Name>;
};

type FrontendConfigTokenHelpers<Palette extends FrontendPaletteConfig> = {
  border: (color: string, width?: string) => string;
  color: <
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  >(
    family: Family,
    step: Step,
  ) => FrontendCssVariable<`${Family}-${Step}`>;
  colorMix: (color: string, amount: string, target?: string) => string;
  modeColor: <
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  Mode extends FrontendPaletteModeKey<Palette>,
  >(
    family: Family,
    step: Step,
    mode: Mode,
  ) => FrontendCssVariable<`${Family}-${Step}-${Mode}`>;
  semantic: <Name extends FrontendPaletteSemanticToken<Palette>>(
    name: Name,
  ) => FrontendCssVariable<Name>;
  variable: FrontendConfigVariableHelper;
};

function createFrontendTokenHelpers<const Palette extends FrontendPaletteConfig>(
  palette: Palette,
): FrontendConfigTokenHelpers<Palette> {
  void palette;

  function variable<Name extends string>(name: Name): FrontendCssVariable<Name>;
  function variable<Name extends string>(
    name: Name,
    fallback: string,
  ): FrontendCssVariableWithFallback<Name>;
  function variable<Name extends string>(name: Name, fallback?: string) {
    return fallback === undefined ? `var(--${name})` : `var(--${name}, ${fallback})`;
  }

  function color<
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  >(family: Family, step: Step): FrontendCssVariable<`${Family}-${Step}`> {
    return variable(`${family}-${String(step)}` as `${Family}-${Step}`);
  }

  function modeColor<
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  Mode extends FrontendPaletteModeKey<Palette>,
  >(family: Family, step: Step, mode: Mode): FrontendCssVariable<`${Family}-${Step}-${Mode}`> {
    return variable(
      `${family}-${String(step)}-${mode}` as `${Family}-${Step}-${Mode}`,
    );
  }

  function semantic<Name extends FrontendPaletteSemanticToken<Palette>>(
    name: Name,
  ): FrontendCssVariable<Name> {
    return variable(name);
  }

  function border(color: string, width = variable("border-width")) {
    return `${width} solid ${color}`;
  }

  function colorMix(color: string, amount: string, target = "transparent") {
    return `color-mix(in srgb, ${color} ${amount}, ${target})`;
  }

  return {
    border,
    color,
    colorMix,
    modeColor,
    semantic,
    variable,
  };
}

export { createFrontendTokenHelpers };
export type {
  FrontendConfigTokenHelpers,
  FrontendConfigVariableHelper,
  FrontendCssVariable,
  FrontendCssVariableWithFallback,
  FrontendPaletteFamily,
  FrontendPaletteModeKey,
  FrontendPaletteSemanticToken,
  FrontendPaletteStep,
};
