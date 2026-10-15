import type { NormalizedFrontendComponentsConfig } from "#tf6lk8wu8qd2";
import { frontendCssVar } from "#5vbaqj4pirp3";
import { DEFAULT_MEDIA_COMPONENTS_CONFIG } from "./media-tokens.js";

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
            arrow: {
              borderWidth: "1px",
              size: "0.5rem",
            },
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
    primitives: Object.freeze({
        actionControl: Object.freeze({}),
        button: Object.freeze({
            root: {
              background: "transparent",
              fontSize: "0.75rem",
              fontWeight: "600",
              gap: "0.5rem",
              height: "1.75rem",
              padding: "0 0.75rem",
              paddingBlock: "0",
              radius: "0",
            },
            sizes: {
              lg: { fontSize: "0.8125rem", height: "2.125rem", paddingInline: "0.875rem" },
              md: { fontSize: "0.75rem", height: "1.75rem", paddingInline: "0.75rem" },
              sm: { fontSize: "0.6875rem", height: "1.5rem", paddingInline: "0.5625rem" },
            },
            variants: {
              chrome: {
                bg: "transparent",
                fontSize: "0.78125rem",
                height: "2rem",
                padding: "0 0.625rem",
                radius: `var(${frontendCssVar("ui-btn-root-radius")}, var(--radius-md, var(${frontendCssVar("radius")}, 0)))`,
                states: { hover: {} },
              },
              danger: { states: { hover: {} } },
              ghost: { states: { hover: {} } },
              primary: { states: { hover: {} } },
              secondary: { states: { hover: {} } },
            },
            slots: {
              icon: {
                fontSize: "0.9375rem",
                radius: `var(${frontendCssVar("ui-btn-root-radius")}, var(--radius-md, var(${frontendCssVar("radius")}, 0)))`,
                size: `var(${frontendCssVar("ui-btn-root-height")}, 1.75rem)`,
                sizes: {
                  lg: { fontSize: "1.125rem", size: "2.125rem" },
                  md: { fontSize: "1rem", size: "1.875rem" },
                  sm: { fontSize: "0.875rem", size: "1.625rem" },
                  xs: { fontSize: "0.75rem", size: "1.375rem" },
                  xs2: { fontSize: "0.625rem", size: "1.125rem" },
                },
              },
            },
            states: {
              disabled: { opacity: "0.55" },
              hover: {},
            },
            tones: {
              green: { states: { hover: {} } },
              highlight: { states: { hover: {} } },
              red: { states: { hover: {} } },
              yellow: { states: { hover: {} } },
            },
        }),
        choice: Object.freeze({
            checked: Object.freeze({}),
            control: Object.freeze({}),
        }),
        dot: Object.freeze({}),
        dropdown: Object.freeze({
            arrow: Object.freeze({}),
            menu: Object.freeze({}),
            option: Object.freeze({
                states: {
                  hover: {},
                  selected: {},
                },
            }),
        }),
        input: Object.freeze({
            file: {
              button: {
                states: {
                  hover: {},
                },
              },
            },
            states: {
              focus: {},
            },
        }),
        loader: Object.freeze({}),
        marquee: Object.freeze({ item: { gap: "1.5rem", px: "0.875rem" }, root: { py: "1.1rem" },
            separator: { fontSize: "1em", opacity: "0.45" }, track: { duration: "38s" } }),
        pill: Object.freeze({}),
        progress: Object.freeze({}),
        tabs: Object.freeze({
            list: { gap: "0.5rem" },
            responsive: {
              mobile: { fontSize: "0.8125rem", height: "2.25rem" },
            },
            root: {
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              height: "2.125rem",
              paddingInline: "0.875rem",
            },
            states: { active: {}, hover: {} },
        }),
        textLink: Object.freeze({
            root: {
              color: "currentColor",
              fontWeight: "inherit",
              textDecorationLine: "underline",
              textDecorationColor: "currentColor",
              textDecorationStyle: "solid",
              textDecorationThickness: "1px",
              textUnderlineOffset: "0.1875rem",
              transition: `color var(${frontendCssVar("transition-fast")}, 180ms) var(${frontendCssVar("transition-easing")}, ease), text-decoration-color var(${frontendCssVar("transition-fast")}, 180ms) var(${frontendCssVar("transition-easing")}, ease)`,
            },
            states: {
              hover: {
                textDecorationColor: "currentColor",
              },
            },
        }),
        toggle: Object.freeze({
            active: Object.freeze({}),
            thumb: Object.freeze({}),
            track: Object.freeze({}),
        }),
        upload: Object.freeze({
            actions: { gap: "0.5rem" },
            content: { gap: "0.5rem" },
            cropper: {
              actions: { gap: "0.5rem" },
              description: { color: `var(${frontendCssVar("text-muted")}, #000)` },
              header: { gap: "0.25rem" },
              modal: {
                maxHeight: "min(90vh, 57.5rem)",
                width: "min(60rem, calc(100vw - 2.5rem))",
              },
              stage: {
                background: `var(${frontendCssVar("surface-muted")}, #fff)`,
                border: `var(${frontendCssVar("border-width")}, 1px) solid var(${frontendCssVar("border")}, #000)`,
                faceColor: "rgb(255 255 255 / 14%)",
                guideWidth: "1px",
                height: "min(62vh, 40rem)",
                lineContrastColor: "#000",
                lineColor: "#fff",
                lineWidth: "1px",
                minHeight: "20rem",
                overlayColor: "rgb(0 0 0 / 72%)",
                pointBackground: "#fff",
                pointBorder: "2px solid #fff",
                pointInset: "0",
                pointRadius: `var(${frontendCssVar("radius-sm")}, 0)`,
                pointSize: "12px",
                radius: `var(${frontendCssVar("radius")}, 0)`,
              },
            },
            hint: {
              color: `var(${frontendCssVar("text-muted")}, #000)`,
              fontSize: "0.92rem",
              lineHeight: "1.15",
            },
            filename: { fontSize: "0.95rem", lineHeight: "1.15" },
            list: { gap: "0.25rem", maxHeight: "5.25rem", paddingLeft: "1.125rem" },
            meta: { gap: "0.5rem" },
            preview: {
              background: `var(${frontendCssVar("surface")}, #fff)`,
              border: `var(${frontendCssVar("border-width")}, 1px) solid var(${frontendCssVar("border")}, #000)`,
              emptyColor: `var(${frontendCssVar("text-muted")}, #000)`,
              emptyFontSize: "0.82rem",
              emptyLineHeight: "1.1",
              emptyPadding: "0.25rem",
              radius: `var(${frontendCssVar("radius")}, 0)`,
              roundRadius: `var(${frontendCssVar("radius-round")}, 999px)`,
              size: "4rem",
            },
            responsive: {
              mobile: {
                actionsGap: "0.25rem",
                cropperModalMaxHeight: "calc(100vh - 24px)",
                cropperModalWidth: "calc(100vw - 24px)",
                cropperStageHeight: "min(52vh, 420px)",
                cropperStageMinHeight: "260px",
                surfaceGap: "0.5rem",
                surfacePadding: "0.5rem",
              },
            },
            root: {
              color: `var(${frontendCssVar("text")}, #000)`,
              gap: "0.5rem",
            },
            surface: {
              background: `var(${frontendCssVar("surface-muted")}, #fff)`,
              border: `var(${frontendCssVar("border-width")}, 1px) solid var(${frontendCssVar("border")}, #000)`,
              color: `var(${frontendCssVar("text")}, #000)`,
              gap: "0.75rem",
              minHeight: "4.5rem",
              padding: "0.75rem",
              radius: `var(${frontendCssVar("radius")}, 0)`,
              states: {
                drag: {
                  background: `var(${frontendCssVar("surface")}, #fff)`,
                  borderColor: `var(${frontendCssVar("focus")}, #000)`,
                },
                hasFiles: {
                  borderStyle: "solid",
                },
              },
            },
        }),
    }),
    shell: Object.freeze({
        breadcrumb: Object.freeze({ fontSize: "0.875rem" }),
        bottomBar: Object.freeze({}),
        footer: Object.freeze({ brand: {}, column: {}, columns: {}, heading: {}, inner: {}, link: {}, links: {}, note: {}, root: { border: "0" }, site: { links: {} }, tagline: {}, tone: { inverse: {}, muted: {} } }),
        header: Object.freeze({
            brand: { button: {}, tag: { offsetY: "0" } },
            link: { active: {} },
            tone: { duration: "320ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        }),
        language: Object.freeze({ option: { states: { current: {} } }, trigger: {} }),
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
        label: Object.freeze({ caps: { fontSize: "0.72rem", fontWeight: "600" } }),
        outline: Object.freeze({ width: "0.125rem" }),
    }),
    surfaces: Object.freeze({
        actionRow: Object.freeze({
            arrow: {},
            body: {},
            root: { gap: "0.75rem", padding: "0.75rem" },
            states: { hover: {} },
            value: { fontSize: "1.25rem", fontWeight: "700" },
        }),
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
        band: Object.freeze({
            root: {
              max: "80rem",
              px: "clamp(1rem, 3vw, 2rem)",
              py: "clamp(2.5rem, 5vw, 4rem)",
            },
            tones: { inverse: {}, muted: {} },
        }),
        button: Object.freeze({
            variants: {
              danger: { states: { hover: {} } },
              ghost: { states: { hover: {} } },
              primary: { states: { hover: {} } },
              secondary: { states: { hover: {} } },
            },
        }),
        frame: Object.freeze({
            action: { glyph: "1.5rem", offset: "1rem", size: "3rem", states: { hover: {} } },
            badge: { offset: "1rem" },
            caption: {},
            cover: { duration: "700ms", position: "50% 50%", states: { hover: { scale: "1.05" } } },
            root: { ratio: "16 / 10" },
            scrim: {},
        }),
        glow: Object.freeze({ root: { blur: "70px", fade: "72%", opacity: "0.85", push: "-0.86", side: "-0.8", size: "clamp(18rem, 92vw, 98rem)" } }),
        hairline: Object.freeze({ cell: {}, root: { min: "16rem" } }),
        motif: Object.freeze({ root: { opacity: "1" } }),
        logo: Object.freeze({ root: { height: "2rem", max: "100%" } }),
        prose: Object.freeze({ root: { gap: "0.75rem", lineHeight: "1.8", max: "47rem" } }),
        rule: Object.freeze({ root: { gap: "0.75rem", width: "0.25rem" } }),
        tag: Object.freeze({
            root: {
              fontSize: "0.75rem",
              fontWeight: "700",
              gap: "0.25rem",
              padding: "0.5rem 0.75rem",
              textTransform: "none",
            },
            tones: { accent: {}, inverse: {} },
        }),
        scrollbar: Object.freeze({ root: { gutter: "stable", width: "auto" } }),
        tile: Object.freeze({
            root: { glyph: "1.5rem", size: "3rem" },
            sizes: { lg: { glyph: "1.75rem", size: "4rem" }, sm: { glyph: "1rem", size: "2.5rem" } },
            slots: { glyph: {} },
            tones: { accent: {}, inverse: {}, muted: {} },
        }),
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
