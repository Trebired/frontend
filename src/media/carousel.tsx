import { Icon } from "#lbkpzw8nphru";
import { frontendClassName, frontendModifierClass } from "#5vbaqj4pirp3";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { ICON_MEDIA_CHEVRON_LEFT, ICON_MEDIA_CHEVRON_RIGHT } from "./icons.js";
import { useCarouselState } from "./carousel-state.js";
import type { CarouselState } from "./carousel-state.js";
import { useResolvedLang } from "./lang.js";

type CarouselSlide = {
  alt?: string;
  src: string;
};

type CarouselControlsPlacement = "bottom" | "sides";

type CarouselProps = {
  className?: string;
  controls?: boolean;
  controlsPlacement?: CarouselControlsPlacement;
  indicators?: boolean;
  intervalMs?: number;
  lang?: string;
  slides: readonly CarouselSlide[];
};

type CarouselLabel = (key: string, vars?: Record<string, unknown>) => string;

type CarouselPartProps = {
  label: CarouselLabel;
  slides: readonly CarouselSlide[];
  state: CarouselState;
};

function activeClass(name: string, active: boolean): string {
  return `${frontendClassName(name)}${active ? " is-active" : ""}`;
}

function rootClass(props: CarouselProps): string {
  const placement = props.controlsPlacement === "bottom" ? frontendModifierClass("carousel", "controls-bottom") : "";
  return [frontendClassName("carousel"), placement, props.className].filter(Boolean).join(" ");
}

function CarouselControls({ label, state }: CarouselPartProps) {
  return (
    <>
    <button
    aria-label={label("mediaSlidePrevious")}
    className={`${frontendClassName("carousel-nav")} ${frontendClassName("carousel-nav-prev")}`}
    onClick={state.showPrevious}
    type="button"
    >
    <Icon spec={ICON_MEDIA_CHEVRON_LEFT} />
    </button>
    <button
    aria-label={label("mediaSlideNext")}
    className={`${frontendClassName("carousel-nav")} ${frontendClassName("carousel-nav-next")}`}
    onClick={state.showNext}
    type="button"
    >
    <Icon spec={ICON_MEDIA_CHEVRON_RIGHT} />
    </button>
    </>
  );
}

function CarouselDots({ label, slides, state }: CarouselPartProps) {
  return (
    <div className={frontendClassName("carousel-dots")}>
    {slides.map((slide, index) => (
          <button
          aria-current={index === state.activeIndex ? "true" : undefined}
          aria-label={label("mediaSlide", { index: index + 1 })}
          className={activeClass("carousel-dot", index === state.activeIndex)}
          key={slide.src}
          onClick={() => state.showAt(index)}
          type="button"
          />
    ))}
    </div>
  );
}

function Carousel(props: CarouselProps) {
  const slides = props.slides ?? [];
  const lang = useResolvedLang(props.lang);
  const state = useCarouselState(slides.length, props.intervalMs ?? 5000);
  const label: CarouselLabel = (key, vars) => sourceLanguageMessage(key, lang, vars);
  const parts = { label, slides, state };

  if (!slides.length) return null;

  return (
    <div
    className={rootClass(props)}
    onBlur={state.onLeave}
    onFocus={state.onEnter}
    onMouseEnter={state.onEnter}
    onMouseLeave={state.onLeave}
    >
    {slides.map((slide, index) => (
          <img
          alt={slide.alt ?? ""}
          aria-hidden={index === state.activeIndex ? undefined : "true"}
          className={activeClass("carousel-slide", index === state.activeIndex)}
          key={slide.src}
          src={slide.src}
          />
    ))}
    {props.controls !== false && slides.length > 1 && <CarouselControls {...parts} />}
    {props.indicators !== false && slides.length > 1 && <CarouselDots {...parts} />}
    </div>
  );
}

export { Carousel };
export type { CarouselControlsPlacement, CarouselProps, CarouselSlide };
