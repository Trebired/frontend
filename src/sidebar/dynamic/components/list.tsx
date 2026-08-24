import { classNames } from "#ndsvdqv80epr";
import { DynamicSidebarLiveRoot } from "./slots.js";
import { DynamicSidebarDivider, DynamicSidebarLinkRow } from "./row.js";
import type {
  DynamicSidebarLiveConfig,
  DynamicSidebarLinkListProps,
} from "#9w9ch5jtlv9e";
import {
  dynamicSidebarLiveConfig,
  isDynamicSidebarDivider,
  normalizeDynamicSidebarItems,
  textValue,
} from "#yv4ubgils4dc";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

function DynamicSidebarLinkList(props: DynamicSidebarLinkListProps) {
  const {
    className,
    currentPath = "",
    items,
    linksId,
    renderCount: _renderCount,
    renderIcon: _renderIcon,
    renderLoader: _renderLoader,
    renderState: _renderState,
    sidebar: sidebarInput,
    wrapLink: _wrapLink,
    ...rest
  } = props;
  const sidebar = sidebarInput || {};
  const list = (
    <ul
    {...rest}
    className={classNames(frontendClassName("sidebar-list"), "sidebar-links", className)}
    {...frontendDataAttrs({ "sidebar-list": "" })}
    id={linksId || rest.id}
    >
    {normalizeDynamicSidebarItems(items).map((item, index) => {
          if (isDynamicSidebarDivider(item)) {
            return <DynamicSidebarDivider index={index} item={item} key={item.key || `divider_${index}`} />;
          }
          return (
            <DynamicSidebarLinkRow
            currentPath={currentPath}
            index={index}
            item={item}
            key={item.key || `${textValue(item.href)}_${index}`}
            options={props}
            sidebar={sidebar}
            />
          );
    })}
    </ul>
  );
  const liveConfig: DynamicSidebarLiveConfig = dynamicSidebarLiveConfig(sidebar);
  return liveConfig.type ? (
    <DynamicSidebarLiveRoot config={liveConfig}>{list}</DynamicSidebarLiveRoot>
  ) : list;
}

export { DynamicSidebarLinkList };
