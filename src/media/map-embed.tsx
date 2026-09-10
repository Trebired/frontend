import { frontendClassName } from "#5vbaqj4pirp3";

type MapEmbedProps = {
  className?: string;
  src: string;
  title: string;
};

function MapEmbed({ className, src, title }: MapEmbedProps) {
  return (
    <iframe
    allowFullScreen
    className={[frontendClassName("map-embed"), className].filter(Boolean).join(" ")}
    height="100%"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    src={src}
    style={{ border: 0 }}
    title={title}
    width="100%"
    />
  );
}

export { MapEmbed };
export type { MapEmbedProps };
