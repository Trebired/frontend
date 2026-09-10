const DEFAULT_MEDIA_COMPONENTS_CONFIG = Object.freeze({
    expandableImage: Object.freeze({
        icon: {
          background: "oklch(14.5% 0 0 / 70%)",
          blur: "0px",
          radius: "0",
          size: "2.5rem",
        },
    }),
    lightbox: Object.freeze({
        backdrop: {
          background: "oklch(14.5% 0 0 / 88%)",
          blur: "0px",
        },
        caption: {
          color: "oklch(100% 0 0 / 70%)",
          fontSize: "0.875rem",
          fontWeight: "700",
        },
        control: {
          background: "oklch(14.5% 0 0 / 35%)",
          blur: "4px",
          radius: "0",
          size: "3rem",
          sizeWide: "3.5rem",
          states: {
            hover: { background: "color-mix(in oklch, var(--primary-500), transparent 30%)" },
          },
        },
        image: {
          radius: "0",
          shadow: "0 25px 50px -12px oklch(0% 0 0 / 25%)",
        },
    }),
});

export { DEFAULT_MEDIA_COMPONENTS_CONFIG };
