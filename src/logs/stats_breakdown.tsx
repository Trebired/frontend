import { card } from "#hzrmwbvgt2ax";
import { createLocalTranslator } from "./shared.js";

type stats_breakdown_props = {
  groupStatsId: string;
  lang?: string;
  labels?: {
    groups?: string;
    levels?: string;
  };
  levelStatsId: string;
};

function stats_breakdown(props: stats_breakdown_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const labels = props.labels || {};
  return (
    <div className="grid gap-sm">
    {card({
          className: "column gap-xs",
          children: (
            <>
            <span className="label">{labels.levels || localT("levels")}</span>
            <div
            className="column gap-xs max-height-lg scroll scroll-min"
            id={String(props.levelStatsId || "")}
            />
            </>
          ),
    })}
    {card({
          className: "column gap-xs",
          children: (
            <>
            <span className="label">{labels.groups || localT("groups")}</span>
            <div
            className="column gap-xs max-height-lg scroll scroll-min"
            id={String(props.groupStatsId || "")}
            />
            </>
          ),
    })}
    </div>
  );
}

export type { stats_breakdown_props };
export default stats_breakdown;
