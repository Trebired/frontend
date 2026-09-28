import { frontendClassNames } from "#5vbaqj4pirp3";

type content_props = {
  ids: Record<string, string>;
};

function logsContent(props: content_props) {
  const ids = props.ids && typeof props.ids === "object" ? props.ids : {};
  return (
    <div id={ids.box} className={frontendClassNames("log-box", "scroll-min")}>
    <div id={ids.reactRoot} />
    </div>
  );
}

export type { content_props };
export default logsContent;
