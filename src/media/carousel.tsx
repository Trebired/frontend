import { Icon } from "#lbkpzw8nphru";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { useCarouselState } from "./carousel-state.js";

const ICON_CHEVRON_LEFT = "remixicon:arrow-left-s-line";
const ICON_CHEVRON_RIGHT = "remixicon:arrow-right-s-line";

type CarouselSlide = {
  alt?: string;
  src: string;
};

type CarouselProps = {
  className?: string;
  controls?: boolean;
  indicators?: boolean;
  intervalMs?: number;
  lang?: string;
  slides: readonly CarouselSlide[];
};

function Carousel(props: CarouselProps) {
  const slides = props.slides ?? [];
  const state = useCarouselState(slides.length, props.intervalMs ?? 5000);
  const label = (key: string, vars?: Record<string, unknown>) => sourceLanguageMessage(key, props.lang, vars);
  const showControls = props.controls !== false && slides.length > 1;
  const showIndicators = props.indicators !== false && slides.length > 1;

  if (!slides.length) return null;

  return (
    <div
    className={["tbf-carousel", props.className].filter(Boolean).join(" ")}
    onBlur={state.onLeave}
    onFocus={state.onEnter}
    onMouseEnter={state.onEnter}
    onMouseLeave={state.onLeave}
    >
    {slides.map((slide, index) => (
          <img
          alt={slide.alt ?? ""}
          aria-hidden={index === state.activeIndex ? undefined : "true"}
          className={`tbf-carousel-slide${index === state.activeIndex ? " is-active" : ""}`}
          key={slide.src}
          src={slide.src}
          />
    ))}

    {showControls && (
        <>
        <button
        aria-label={label("mediaSlidePrevious")}
        className="tbf-carousel-nav tbf-carousel-nav-prev"
        onClick={state.showPrevious}
        type="button"
        >
        <Icon spec={ICON_CHEVRON_LEFT} />
        </button>
        <button
        aria-label={label("mediaSlideNext")}
        className="tbf-carousel-nav tbf-carousel-nav-next"
        onClick={state.showNext}
        type="button"
        >
        <Icon spec={ICON_CHEVRON_RIGHT} />
        </button>
        </>
    )}

    {showIndicators && (
        <div className="tbf-carousel-dots">
        {slides.map((slide, index) => (
              <button
              aria-current={index === state.activeIndex ? "true" : undefined}
              aria-label={label("mediaSlide", { index: index + 1 })}
              className={`tbf-carousel-dot${index === state.activeIndex ? " is-active" : ""}`}
              key={slide.src}
              onClick={() => state.showAt(index)}
              type="button"
              />
        ))}
        </div>
    )}
    </div>
  );
}

export { Carousel };
export type { CarouselProps, CarouselSlide };
