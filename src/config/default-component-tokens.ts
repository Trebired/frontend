import type { NormalizedFrontendComponentsConfig } from "./types.js";

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
              padding: "15px",
              radius: "0",
            },
            intents: { error: {}, info: {}, success: {}, warn: {} },
            layout: {
              actionsGap: "8px",
              bodyGap: "8px",
              gap: "10px",
            },
            placement: {
              maxWidth: "520px",
              offset: "18px",
            },
            slots: {
              description: { fontSize: "0.92rem" },
              icon: { fontWeight: "700", size: "15px" },
              progress: { height: "4px" },
              title: { fontWeight: "400" },
            },
        }),
    }),
    overlays: Object.freeze({
        modal: Object.freeze({
            backdrop: {
              background: "var(--tbf-overlay, rgb(0 0 0 / 48%))",
              opacity: "1",
              padding: "24px",
            },
            content: {
              background: "var(--tbf-surface, #fff)",
              border: "var(--tbf-border-width, 1px) solid var(--tbf-border, #000)",
              color: "var(--tbf-text, #000)",
              maxHeight: "min(80vh, 720px)",
              padding: "20px",
              radius: "var(--tbf-radius, 0)",
              shadow: "var(--tbf-shadow, 0 0 0 1px #000)",
              width: "min(720px, calc(100vw - 48px))",
            },
            motion: {
              duration: "var(--tbf-transition-normal)",
              easing: "ease",
              initialScale: "0.96",
              openScale: "1",
            },
        }),
        popover: Object.freeze({
            item: {
              root: {
                height: "35px",
                padding: "5px 10px",
                radius: "0",
              },
              states: {
                hover: {},
                selected: {},
              },
            },
            panel: {
              background: "transparent",
              border: "1px solid currentColor",
              color: "currentColor",
              gap: "2px",
              padding: "8px",
              radius: "0",
            },
        }),
        tooltip: Object.freeze({
            arrow: {
              borderWidth: "1px",
              size: "8px",
            },
            motion: {
              duration: "170ms",
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            panel: {
              background: "transparent",
              border: "1px solid currentColor",
              color: "currentColor",
              fontFamily: "sans-serif",
              fontSize: "12px",
              lineHeight: "1.3",
              padding: "7px 9px",
              radius: "0",
              shadow: "var(--tbf-shadow, 0 0 0 1px #000)",
            },
        }),
    }),
    primitives: Object.freeze({
        actionControl: Object.freeze({}),
        button: Object.freeze({
            root: {
              background: "transparent",
              border: "1px solid currentColor",
              color: "currentColor",
              fontSize: "12px",
              fontWeight: "600",
              gap: "8px",
              height: "28px",
              padding: "0 12px",
              paddingBlock: "0",
              radius: "0",
            },
            sizes: {
              lg: { fontSize: "13px", height: "34px", paddingInline: "14px" },
              md: { fontSize: "12px", height: "28px", paddingInline: "12px" },
              sm: { fontSize: "11px", height: "24px", paddingInline: "9px" },
            },
            slots: {
              icon: {
                fontSize: "15px",
                size: "28px",
                sizes: {
                  lg: { fontSize: "18px", size: "34px" },
                  md: { fontSize: "16px", size: "30px" },
                  sm: { fontSize: "14px", size: "26px" },
                  xs: { fontSize: "12px", size: "22px" },
                  xs2: { fontSize: "10px", size: "18px" },
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
        pill: Object.freeze({}),
        progress: Object.freeze({}),
        tabs: Object.freeze({
            list: { gap: "8px" },
            responsive: {
              mobile: { fontSize: "13px", height: "36px" },
            },
            root: {
              background: "transparent",
              border: "1px solid currentColor",
              color: "currentColor",
              fontFamily: "sans-serif",
              fontSize: "14px",
              height: "34px",
              paddingInline: "14px",
              radius: "0",
            },
            states: { active: {}, hover: {} },
        }),
        textLink: Object.freeze({
            root: {
              color: "currentColor",
              fontWeight: "inherit",
              textDecorationLine: "underline",
              textDecorationColor: "currentColor",
              textDecorationStyle: "dotted",
              textDecorationThickness: "1px",
              textUnderlineOffset: "3px",
              transition: "color 120ms ease, text-decoration-color 120ms ease",
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
            actions: { gap: "8px" },
            content: { gap: "8px" },
            cropper: {
              actions: { gap: "8px" },
              description: { color: "var(--tbf-text-muted, #000)" },
              header: { gap: "4px" },
              modal: {
                maxHeight: "min(90vh, 920px)",
                width: "min(960px, calc(100vw - 40px))",
              },
              stage: {
                background: "var(--tbf-surface-muted, #fff)",
                border: "var(--tbf-border-width, 1px) solid var(--tbf-border, #000)",
                faceColor: "rgb(255 255 255 / 14%)",
                guideWidth: "1px",
                height: "min(62vh, 640px)",
                lineContrastColor: "#000",
                lineColor: "#fff",
                lineWidth: "1px",
                minHeight: "320px",
                overlayColor: "rgb(0 0 0 / 72%)",
                pointBackground: "#fff",
                pointBorder: "2px solid #fff",
                pointInset: "0",
                pointRadius: "var(--tbf-radius-sm, 0)",
                pointSize: "12px",
                radius: "var(--tbf-radius, 0)",
              },
            },
            hint: {
              color: "var(--tbf-text-muted, #000)",
              fontSize: "0.92rem",
              lineHeight: "1.15",
            },
            filename: { fontSize: "0.95rem", lineHeight: "1.15" },
            list: { gap: "4px", maxHeight: "84px", paddingLeft: "18px" },
            meta: { gap: "8px" },
            preview: {
              background: "var(--tbf-surface, #fff)",
              border: "var(--tbf-border-width, 1px) solid var(--tbf-border, #000)",
              emptyColor: "var(--tbf-text-muted, #000)",
              emptyFontSize: "0.82rem",
              emptyLineHeight: "1.1",
              emptyPadding: "4px",
              radius: "var(--tbf-radius, 0)",
              roundRadius: "var(--tbf-radius-round, 999px)",
              size: "64px",
            },
            responsive: {
              mobile: {
                actionsGap: "4px",
                cropperModalMaxHeight: "calc(100vh - 24px)",
                cropperModalWidth: "calc(100vw - 24px)",
                cropperStageHeight: "min(52vh, 420px)",
                cropperStageMinHeight: "260px",
                surfaceGap: "8px",
                surfacePadding: "8px",
              },
            },
            root: {
              color: "var(--tbf-text, #000)",
              gap: "8px",
            },
            surface: {
              background: "var(--tbf-surface-muted, #fff)",
              border: "var(--tbf-border-width, 1px) solid var(--tbf-border, #000)",
              color: "var(--tbf-text, #000)",
              gap: "12px",
              minHeight: "72px",
              padding: "12px",
              radius: "var(--tbf-radius, 0)",
              states: {
                drag: {
                  background: "var(--tbf-surface, #fff)",
                  borderColor: "var(--tbf-focus, #000)",
                },
                hasFiles: {
                  borderStyle: "solid",
                },
              },
            },
        }),
    }),
    shell: Object.freeze({
        header: Object.freeze({ brand: { tag: { offsetY: "0" } } }),
        language: Object.freeze({ option: { states: { current: {} } } }),
        sidebar: Object.freeze({}),
        theme: Object.freeze({ option: { states: { current: {} } } }),
    }),
    surfaces: Object.freeze({
        button: Object.freeze({}),
        card: Object.freeze({
            body: {
              divider: {},
            },
            root: {
              background: "transparent",
              border: "1px solid currentColor",
              minHeight: "35px",
              padding: "14px 14px 12px 14px",
              radius: "0",
            },
            row: {
              background: "transparent",
              padding: "9px 12px",
              radius: "0",
              states: {
                excluded: {},
                hover: {},
                selected: {},
              },
            },
            title: {
              fontSize: "15px",
              fontWeight: "700",
              margin: "0 0 10px 0",
            },
        }),
    }),
  } satisfies NormalizedFrontendComponentsConfig);

export { DEFAULT_FRONTEND_COMPONENTS_CONFIG };
