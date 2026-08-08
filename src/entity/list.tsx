import { createElement, Fragment, type ReactNode } from "react";
import { card } from "#6hfutrhvm6x6";
import search, { search_panel } from "#xkgew618b00p";

type EntityListLive = {
  event?: string;
  room: string;
};

type EntityListProps<T> = {
  description?: ReactNode;
  emptyText?: ReactNode;
  familyKey: string;
  filters?: ReactNode[];
  itemKey?: (item: T, index: number) => string;
  items: T[];
  lang?: string;
  live?: EntityListLive;
  placeholder?: string;
  renderItem: (item: T, index: number) => ReactNode;
  title?: ReactNode;
};

function text(value: unknown) {
  return String(value == null ? "" : value).trim();
}

function entityListAnchorId(familyKey: string) {
  return `live-list-${text(familyKey)}`;
}

function listItems<T>(props: EntityListProps<T>) {
  return props.items.map((item, index) => (
    <Fragment key={props.itemKey ? props.itemKey(item, index) : index}>
      {props.renderItem(item, index)}
    </Fragment>
  ));
}

function listHeader<T>(props: EntityListProps<T>) {
  if (!props.title && !props.description) return null;
  return (
    <>
      {props.title ? <h3>{props.title}</h3> : null}
      {props.description ? <p className="text-muted">{props.description}</p> : null}
    </>
  );
}

function listCard<T>(props: EntityListProps<T>) {
  return card({
    className: "column gap-sm",
    children: (
      <>
        {listHeader(props)}
        {props.items.length ? (
          listItems(props)
        ) : (
          <p className="text-muted">{props.emptyText || "Nothing here yet."}</p>
        )}
      </>
    ),
  });
}

function listBody<T>(props: EntityListProps<T>, familyKey: string, anchorId: string) {
  if (!props.placeholder) {
    return (
      <div className="column gap-sm" id={anchorId}>
        {listCard(props)}
      </div>
    );
  }
  return (
    <>
      {search({
        familyKey,
        filters: props.filters,
        placeholder: props.placeholder,
      })}
      {search_panel({
        emptyText: props.emptyText,
        familyKey,
        id: anchorId,
        children: listCard(props),
      })}
    </>
  );
}

function liveMarker(live: EntityListLive | undefined, anchorId: string) {
  if (!live || !live.room) return null;
  return createElement("live-list", {
    hidden: true,
    "data-live-list-anchor": anchorId,
    "data-live-list-event": text(live.event),
    "data-live-list-room": live.room,
  });
}

function entity_list<T>(props: EntityListProps<T>) {
  const familyKey = text(props.familyKey);
  const anchorId = entityListAnchorId(familyKey);
  return (
    <div className="column gap-sm">
      {listBody(props, familyKey, anchorId)}
      {liveMarker(props.live, anchorId)}
    </div>
  );
}

const listAnchorId = entityListAnchorId;

export { entity_list, entityListAnchorId, listAnchorId };
export type { EntityListLive, EntityListProps };
export default entity_list;
