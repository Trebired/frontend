type MapEmbedProps = {
  className?: string;
  src: string;
  title: string;
};

function MapEmbed({ className, src, title }: MapEmbedProps) {
  return (
    <iframe
    allowFullScreen
    className={["tbf-map-embed", className].filter(Boolean).join(" ")}
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
