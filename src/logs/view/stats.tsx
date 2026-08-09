import { copy_button } from "#k632wzgl64a3";
import tabs, { tab_panel } from "#92vilwel70ga";
import {
  card,
  primitiveInlineRowClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import stats_breakdown from "#ojqk8hhrpft6";

function statsTabs(model: any) {
  return tabs({
      familyClassName: "width-full",
      headerClassName: primitiveInlineRowClassName({
        className: "logs-stats-header",
        gap: "sm",
        verticalCenter: true,
      }),
      headerLeading: (
        <div className="right no-shrink logs-stats-copy">
        {copy_button({
              size: "md",
              target: `#${model.ids.statsCopy}`,
              title: model.t("copyStats"),
              tooltip: model.t("copyStats"),
        })}
        </div>
      ),
      items: [
        { id: model.logId("stats-loaded"), label: model.t("loadedTab") },
        { id: model.logId("stats-total"), label: model.t("totalTab") },
      ],
      listClassName: "width-full",
      rootClassName: "width-full",
  });
}

function statsBreakdownPanel(
  model: any,
  id: string,
  levelStatsId: string,
  groupStatsId: string,
  hidden = false,
) {
  return tab_panel({
      className: primitiveStackClassName({ gap: "sm" }),
      defaultActive: !hidden,
      familyKey: "",
      id,
      route: id,
      children: (
        <>
        {stats_breakdown({
              groupStatsId,
              labels: {
                groups: model.t("groups"),
                levels: model.t("levels"),
              },
              levelStatsId,
        })}
        </>
      ),
  });
}

function logsStatsPanel(model: any) {
  if (!model.showStats) return null;
  return card({
      id: model.ids.statsCard,
      "data-logs-raw-hide": "",
      gap: "sm",
      children: (
        <>
        {statsTabs(model)}
        <textarea id={model.ids.statsCopy} readOnly hidden />
        {statsBreakdownPanel(
            model,
            model.logId("stats-loaded"),
            model.ids.levelStats,
            model.ids.groupStats,
        )}
        {statsBreakdownPanel(
            model,
            model.logId("stats-total"),
            model.ids.totalTabLevelStats,
            model.ids.totalTabGroupStats,
            true,
        )}
        </>
      ),
  });
}

export { logsStatsPanel };
