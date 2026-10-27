import { frontendCssVar } from "#5vbaqj4pirp3";

const DEFAULT_PRIMITIVE_COMPONENTS_CONFIG = Object.freeze({
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
    quote: Object.freeze({}),
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
        motion: {},
        root: {},
        states: { active: {}, hover: {} },
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
});

export { DEFAULT_PRIMITIVE_COMPONENTS_CONFIG };
