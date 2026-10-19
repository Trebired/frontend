import type { NormalizedFrontendComponentsConfig } from "#tf6lk8wu8qd2";
import { frontendCssVar } from "#5vbaqj4pirp3";
import { DEFAULT_MEDIA_COMPONENTS_CONFIG } from "./media-tokens.js";
import { DEFAULT_PRIMITIVE_COMPONENTS_CONFIG } from "./primitive-tokens.js";

const DEFAULT_FRONTEND_COMPONENTS_CONFIG = Object.freeze({
    data: Object.freeze({
        graph: Object.freeze({ download: Object.freeze({}), heatmap: Object.freeze({}), upload: Object.freeze({}) }),
        log: Object.freeze({ line: Object.freeze({}), selection: Object.freeze({}) }),
    }),
    feedback: Object.freeze({
        flash: Object.freeze({
            container: {
              background: "transparent",
              border: "1px solid currentColor",
              color: "currentColor",
              padding: "0.9375rem",
              radius: "0",
            },
            intents: { error: {}, info: {}, success: {}, warn: {} },
            layout: {
              actionsGap: "0.5rem",
              bodyGap: "0.5rem",
              gap: "0.625rem",
            },
            placement: {
              maxWidth: "32.5rem",
              offset: "1.125rem",
            },
            slots: {
              description: { fontSize: "0.92rem" },
              icon: { fontWeight: "700", size: "1.125rem" },
              progress: { height: "0.25rem" },
              title: { fontWeight: "400" },
            },
        }),
    }),
    media: DEFAULT_MEDIA_COMPONENTS_CONFIG,
    overlays: Object.freeze({
        modal: Object.freeze({
            backdrop: {
              background: `var(${frontendCssVar("overlay")}, rgb(0 0 0 / 48%))`,
              blur: "8px",
              opacity: "1",
              padding: "1.5rem",
            },
            content: {
              background: `var(${frontendCssVar("surface")}, #fff)`,
              border: `var(${frontendCssVar("border-width")}, 1px) solid var(${frontendCssVar("border")}, #000)`,
              color: `var(${frontendCssVar("text")}, #000)`,
              maxHeight: "min(80vh, 45rem)",
              padding: "1.25rem",
              radius: `var(${frontendCssVar("radius")}, 0)`,
              shadow: `var(${frontendCssVar("shadow")}, 0 0 0 1px #000)`,
              width: "min(45rem, calc(100vw - 3rem))",
            },
            motion: {
              duration: `var(${frontendCssVar("transition-normal")})`,
              easing: "ease",
              initialScale: "0.96",
              openScale: "1",
            },
        }),
        popover: Object.freeze({
            group: {},
            item: {
              root: {
                height: "2.1875rem",
                padding: "0.3125rem 0.625rem",
                radius: "0",
              },
              stacked: {},
              state: {
                hover: {},
                selected: {},
              },
            },
            panel: {
              gap: "0.125rem",
              minW: "13.75rem",
              padding: "0.5rem",
              radius: "0",
            },
        }),
        tooltip: Object.freeze({
            motion: {
              duration: "170ms",
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            panel: {
              fontSize: "0.75rem",
              lineHeight: "1.3",
              padding: "0.4375rem 0.5625rem",
            },
        }),
    }),
    primitives: DEFAULT_PRIMITIVE_COMPONENTS_CONFIG,
    shell: Object.freeze({
        breadcrumb: Object.freeze({ fontSize: "0.875rem" }),
        bottomBar: Object.freeze({}),
        footer: Object.freeze({
            brand: {}, column: {}, columns: {}, heading: {}, inner: {}, links: {}, note: {},
            root: { border: "0" }, site: { links: {} }, tagline: {}, tone: { inverse: {}, muted: {} },
        }),
        header: Object.freeze({
            brand: { button: {}, tag: { offsetY: "0" } },
            tone: { duration: "320ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        }),
        language: Object.freeze({ option: { states: { current: {} } }, trigger: {} }),
        outline: Object.freeze({ frame: {}, layout: {} }),
        error: Object.freeze({
            actions: { align: "center", gap: "0.75rem" },
            body: { align: "center", gap: "0.75rem", max: "40rem", textAlign: "center" },
            lead: { fontSize: "1.05rem", max: "36rem" },
            locale: { offset: "clamp(1rem, 3vw, 2rem)" },
            root: { minHeight: "100dvh", px: "clamp(1rem, 3vw, 2rem)", py: "clamp(3rem, 8vw, 7rem)" },
            status: { fontSize: "clamp(4.5rem, 18vw, 10rem)", fontWeight: "900", letterSpacing: "-0.02em" },
            title: {},
        }),
        sidebar: Object.freeze({}),
        theme: Object.freeze({ option: { states: { current: {} } } }),
    }),
    typography: Object.freeze({
        container: Object.freeze({}),
        heading: Object.freeze({ variants: Object.freeze({}) }),
        indent: Object.freeze({}),
        label: Object.freeze({ caps: { fontSize: "0.72rem", fontWeight: "600" } }),
        outline: Object.freeze({ width: "0.125rem" }),
    }),
    surfaces: Object.freeze({
        brandCanvas: Object.freeze({
            art: {},
            caption: { gap: "0.75rem" },
            clear: {},
            guide: {},
            measure: { fontSize: "0.68rem", offset: "0.75rem" },
            root: { gap: "0.75rem" },
            spec: { fontSize: "0.72rem" },
            stage: { minHeight: "14rem", padding: "2.5rem" },
            tones: { accent: {}, inverse: {}, muted: {} },
        }),
        button: Object.freeze({
            variants: {
              danger: { states: { hover: {} } },
              ghost: { states: { hover: {} } },
              primary: { states: { hover: {} } },
              secondary: { states: { hover: {} } },
            },
        }),
        hairline: Object.freeze({ cell: {}, root: { min: "16rem" } }),
        motif: Object.freeze({ root: { opacity: "1" } }),
        logo: Object.freeze({ root: { height: "2rem", max: "100%" } }),
        scrollbar: Object.freeze({ root: { gutter: "stable", width: "auto" } }),
        card: Object.freeze({
            body: {
              divider: {},
            },
            root: {
              background: "transparent",
              border: "1px solid currentColor",
              minHeight: "2.1875rem",
              padding: "0.875rem 0.875rem 0.75rem 0.875rem",
              radius: "0",
            },
            sizes: { lg: {}, md: {}, sm: {} },
            row: {
              background: "transparent",
              padding: "0.5625rem 0.75rem",
              radius: "0",
              states: {
                excluded: {},
                hover: {},
                selected: {},
              },
            },
            title: {
              fontSize: "0.9375rem",
              fontWeight: "700",
              margin: "0 0 0.625rem 0",
            },
            tones: { accent: {}, inverse: {}, muted: {}, surface: {} },
        }),
    }),
  } satisfies NormalizedFrontendComponentsConfig);

export { DEFAULT_FRONTEND_COMPONENTS_CONFIG };
