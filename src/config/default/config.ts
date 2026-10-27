import { EMPTY_A11Y_CONFIG } from "./../a11y.js";
import { DEFAULT_FLAG_COUNTRIES } from "./../flags.js";
import { DEFAULT_FRONTEND_BREAKPOINTS } from "./../breakpoints.js";
import { DEFAULT_FRONTEND_COMPONENTS_CONFIG } from "./../component-tokens.js";
import { DEFAULT_FRONTEND_SCALES_CONFIG } from "./scales.js";
import { defaultIconAliases } from "#rqcj8y6keks2";
import { EMPTY_LANGUAGE_CONFIG } from "./../language.js";
import { EMPTY_MONEY_CONFIG } from "./../money.js";
import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";
import { PACKAGE_VERSION } from "./../package.js";

import type { FrontendIconPack, FrontendSystemKey, NormalizedFrontendConfig } from "./../types.js";

const THEME_MODE_ATTRIBUTE = frontendDataAttr("theme");

const SUPPORTED_ICON_PACKS: FrontendIconPack[] = ["remixicon", "simple-icons"];

const SYSTEM_ORDER: FrontendSystemKey[] = [
  "theme",
  "layout",
  "language",
  "logs",
  "layer",
  "icons",
  "media",
  "progress",
  "flash",
  "tooltip",
  "popover",
  "modal",
  "sidebar",
  "inputs",
  "actions",
  "code",
  "editor",
  "explorer",
  "primitives",
  "fullscreen",
  "surface",
  "graph",
  "hollow",
  "document",
  "indent",
  "visibility",
  "reveal",
  "a11y",
];

const DEFAULT_FRONTEND_CONFIG: NormalizedFrontendConfig = Object.freeze({
    a11y: EMPTY_A11Y_CONFIG,
    assets: Object.freeze({
        favicon: Object.freeze({
            dark: "",
            default: "",
            ico: Object.freeze([]) as number[],
            light: "",
            sizes: Object.freeze([]) as number[],
        }) as NormalizedFrontendConfig["assets"]["favicon"],
        flags: Object.freeze({
            countries: Object.freeze([...DEFAULT_FLAG_COUNTRIES]) as string[],
            ratio: "3x2",
        }) as NormalizedFrontendConfig["assets"]["flags"],
        fonts: Object.freeze({
            families: Object.freeze([]) as NormalizedFrontendConfig["assets"]["fonts"]["families"],
            sans: "",
        }),
        icons: Object.freeze({
            aliases: Object.freeze({ ...defaultIconAliases }),
            endpoint: "/__icons/svg",
            mode: "server",
            packs: Object.freeze([...SUPPORTED_ICON_PACKS]) as FrontendIconPack[],
            specs: Object.freeze([]) as unknown as string[],
        }),
    }),
    components: DEFAULT_FRONTEND_COMPONENTS_CONFIG,
    containers: Object.freeze({}),
    design: Object.freeze({
        breakpoints: Object.freeze({ ...DEFAULT_FRONTEND_BREAKPOINTS }) as Record<string, number>,
        glass: null,
        interactions: Object.freeze({
            activePress: Object.freeze({
                brightness: "0.9",
                enabled: false,
                filter: "none",
            }),
        }),
        palette: Object.freeze({
            modes: Object.freeze([]) as NormalizedFrontendConfig["design"]["palette"]["modes"],
            semantic: Object.freeze([]) as NormalizedFrontendConfig["design"]["palette"]["semantic"],
            suffixedVariants: true,
        }),
        scales: DEFAULT_FRONTEND_SCALES_CONFIG,
        scrollBehavior: "smooth",
        semantics: Object.freeze({}),
        titles: Object.freeze({ fit: null }),
    }),
    forVersion: PACKAGE_VERSION,
    language: EMPTY_LANGUAGE_CONFIG,
    links: null,
    money: EMPTY_MONEY_CONFIG,
    prefix: FRONTEND_PREFIX,
    runtime: Object.freeze({
        layer: Object.freeze({}),
        layout: Object.freeze({}),
        progress: Object.freeze({ height: "3px" }),
        theme: Object.freeze({
            cssVariables: true,
            dark: "",
            defaultMode: "",
            light: "",
            modes: Object.freeze([]) as NormalizedFrontendConfig["runtime"]["theme"]["modes"],
            tokens: Object.freeze({}),
        }),
    }),
    systems: Object.freeze(Object.fromEntries(SYSTEM_ORDER.map((key) => [key, true]))) as Record<FrontendSystemKey, boolean>,
});

export { DEFAULT_FRONTEND_CONFIG, SUPPORTED_ICON_PACKS, SYSTEM_ORDER, THEME_MODE_ATTRIBUTE };
