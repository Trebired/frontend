import { Icon } from "#lbkpzw8nphru";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { ICON_MEDIA_CHEVRON_LEFT, ICON_MEDIA_CHEVRON_RIGHT } from "./icons.js";
import { useCarouselState } from "./carousel-state.js";
import { useResolvedLang } from "./lang.js";


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
  const lang = useResolvedLang(props.lang);
  const state = useCarouselState(slides.length, props.intervalMs ?? 5000);
  const label = (key: string, vars?: Record<string, unknown>) => sourceLanguageMessage(key, lang, vars);
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
        <Icon spec={ICON_MEDIA_CHEVRON_LEFT} />
        </button>
        <button
        aria-label={label("mediaSlideNext")}
        className="tbf-carousel-nav tbf-carousel-nav-next"
        onClick={state.showNext}
        type="button"
        >
        <Icon spec={ICON_MEDIA_CHEVRON_RIGHT} />
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
