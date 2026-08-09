import { stringifyJsonForHtml } from "./shared.js";

type paged_content_props = {
  log_style?: any;
  logs?: any[];
};

function paged_content(props: paged_content_props) {
  const payload = stringifyJsonForHtml({
      logs: Array.isArray(props.logs) ? props.logs : [],
      log_style:
      props.log_style && typeof props.log_style === "object"
      ? props.log_style
      : null,
  });

  return (
    <div data-deployment-log-page="" hidden>
    <script
    type="application/json"
    data-deployment-log-page-data=""
    dangerouslySetInnerHTML={{ __html: payload }}
    />
    </div>
  );
}

export default paged_content;
