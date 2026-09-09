import { useId } from "react";

import { Icon } from "#lbkpzw8nphru";
import { sourceLanguageMessage } from "#2d8f076g07hg";
import { useGalleryState } from "./gallery-state.js";
import { Lightbox } from "./lightbox.js";

const ICON_MAXIMIZE = "remixicon:fullscreen-line";

type ExpandableImageProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  images?: readonly string[];
  index?: number;
  lang?: string;
  src: string;
};

function galleryAlt(alt: string, length: number, index: number): string {
  return length > 1 ? `${alt} ${index + 1}` : alt;
}

function ExpandableImage(props: ExpandableImageProps) {
  const gallery = props.images?.length ? [...props.images] : [props.src];
  const start = Math.min(Math.max(props.index ?? 0, 0), gallery.length - 1);
  const titleId = useId();
  const state = useGalleryState(gallery.length, start);

  const thumbnailAlt = galleryAlt(props.alt, gallery.length, start);
  const label = sourceLanguageMessage("mediaExpand", props.lang, { alt: thumbnailAlt });

  return (
    <>
    <button
    aria-label={label}
    className={["tbf-expandable-image", props.className].filter(Boolean).join(" ")}
    onClick={() => state.expand(start)}
    type="button"
    >
    <img
    alt={thumbnailAlt}
    className={["tbf-expandable-image-img", props.imageClassName].filter(Boolean).join(" ")}
    loading="lazy"
    src={props.src}
    />
    <span className="tbf-expandable-image-icon">
    <Icon spec={ICON_MAXIMIZE} />
    </span>
    </button>

    {state.open && (
        <Lightbox
        alt={galleryAlt(props.alt, gallery.length, state.activeIndex)}
        close={state.close}
        hasNext={state.activeIndex < gallery.length - 1}
        hasPrevious={state.activeIndex > 0}
        lang={props.lang}
        showNext={state.showNext}
        showPrevious={state.showPrevious}
        src={gallery[state.activeIndex] ?? props.src}
        titleId={titleId}
        visible={state.visible}
        />
    )}
    </>
  );
}

export { ExpandableImage };
export type { ExpandableImageProps };
