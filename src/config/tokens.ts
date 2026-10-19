import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { cssToken } from "./shared.js";
import type { FrontendPaletteConfig } from "./types.js";

type FrontendGapSize = "lg" | "md" | "sm" | "xl" | "xl2" | "xs" | "xs2";

type FrontendRadiusSize = "lg" | "md" | "sm" | "xs";

type FrontendPaletteModes<Palette extends FrontendPaletteConfig> = NonNullable<Palette["modes"]>;
type FrontendPaletteModeKey<Palette extends FrontendPaletteConfig> =
keyof FrontendPaletteModes<Palette>&string;
type FrontendPaletteModeValue<Palette extends FrontendPaletteConfig> =
FrontendPaletteModes<Palette>[FrontendPaletteModeKey<Palette>];
type FrontendPaletteFamily<Palette extends FrontendPaletteConfig> =
keyof FrontendPaletteModeValue<Palette>["scale"]&string;
type FrontendPaletteStep<
Palette extends FrontendPaletteConfig,
Family extends FrontendPaletteFamily<Palette>,
> = Extract<
keyof FrontendPaletteModeValue<Palette>["scale"][Family],
string | number
>;
type FrontendPaletteSemanticToken<Palette extends FrontendPaletteConfig> =
keyof NonNullable<Palette["semantic"]>&string;

declare const FRONTEND_TOKEN: unique symbol;

type FrontendTokenBrand = { readonly [FRONTEND_TOKEN]: true };

type FrontendCssVariable<Name extends string> = `var(--${Name})`&FrontendTokenBrand;
type FrontendCssVariableWithFallback<Name extends string> = `var(--${Name}, ${string})`&FrontendTokenBrand;
type FrontendTokenValue = string&FrontendTokenBrand;

type FrontendConfigVariableHelper = {
  <Name extends string > (name: Name): FrontendCssVariable<Name>;
  <Name extends string > (name: Name, fallback: string): FrontendCssVariableWithFallback<Name>;
};

type FrontendConfigTokenHelpers<Palette extends FrontendPaletteConfig> = {
  border: (color: string, width?: string) => FrontendTokenValue;
  frontend: (name: string, fallback?: string) => FrontendTokenValue;
  gap: (size: FrontendGapSize) => FrontendTokenValue;
  radius: (size?: FrontendRadiusSize) => FrontendTokenValue;
  color: <
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  >(
    family: Family,
    step: Step,
  ) => FrontendCssVariable<`${Family}-${Step}`>;
  colorMix: (color: string, amount: string, target?: string) => FrontendTokenValue;
  css: (parts: TemplateStringsArray, ...values: Array<string|number>) => FrontendTokenValue;
  modeColor: <
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  Mode extends FrontendPaletteModeKey<Palette>,
  >(
    family: Family,
    step: Step,
    mode: Mode,
  ) => FrontendCssVariable<`${Family}-${Step}-${Mode}`>;
  semantic: <Name extends FrontendPaletteSemanticToken < Palette >> (
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
    const value = fallback === undefined ? `var(--${name})` : `var(--${name}, ${fallback})`;
    return cssToken<FrontendCssVariable<Name>>(value);
  }

  function color<
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  >(family: Family, step: Step): FrontendCssVariable<`${Family}-${Step}`> {
    return variable(`${family}-${String(step)}`as `${Family}-${Step}`);
  }

  function modeColor<
  Family extends FrontendPaletteFamily<Palette>,
  Step extends FrontendPaletteStep<Palette, Family>,
  Mode extends FrontendPaletteModeKey<Palette>,
  >(family: Family, step: Step, mode: Mode): FrontendCssVariable<`${Family}-${Step}-${Mode}`> {
    return variable(
      `${family}-${String(step)}-${mode}`as `${Family}-${Step}-${Mode}`,
    );
  }

  function semantic<Name extends FrontendPaletteSemanticToken<Palette>>(
    name: Name,
  ): FrontendCssVariable<Name> {
    return variable(name);
  }

  function frontend<Name extends string>(name: Name, fallback?: string) {
    return (fallback === undefined
      ? variable(`${FRONTEND_PREFIX}-${name}`as `${typeof FRONTEND_PREFIX}-${Name}`)
      : variable(`${FRONTEND_PREFIX}-${name}`as `${typeof FRONTEND_PREFIX}-${Name}`, fallback)) as unknown as FrontendTokenValue;
  }

  function gap(size: FrontendGapSize): FrontendTokenValue {
    return frontend(`gap-${size}`);
  }

  function radius(size?: FrontendRadiusSize): FrontendTokenValue {
    return frontend(size ? `radius-${size}` : "radius");
  }

  function border(color: string, width: string = variable("border-width")) {
    return cssToken<FrontendTokenValue>(`${width} solid ${color}`);
  }

  function colorMix(color: string, amount: string, target = "transparent") {
    return cssToken<FrontendTokenValue>(`color-mix(in srgb, ${color} ${amount}, ${target})`);
  }

  function css(parts: TemplateStringsArray, ...values: Array<string|number>) {
    const text = parts.reduce(
      (out, part, index) => `${out}${index ? String(values[index - 1]) : ""}${part}`,
      "",
    );
    return cssToken<FrontendTokenValue>(text);
  }

  return {
    border,
    color,
    colorMix,
    css,
    frontend,
    gap,
    modeColor,
    radius,
    semantic,
    variable,
  };
}

export { createFrontendTokenHelpers };
export type {
  FrontendConfigTokenHelpers,
  FrontendGapSize,
  FrontendRadiusSize,
  FrontendTokenValue,
  FrontendConfigVariableHelper,
  FrontendCssVariable,
  FrontendCssVariableWithFallback,
  FrontendPaletteFamily,
  FrontendPaletteModeKey,
  FrontendPaletteSemanticToken,
  FrontendPaletteStep,
};
