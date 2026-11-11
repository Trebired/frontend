import { frontendDataAttr, frontendDataSelector } from "./../namespace/index.js";
import type { CmsField } from "./schema.js";

const CMS_FIELD_ATTR = "cms-field";
const CMS_KIND_ATTR = "cms-kind";
const CMS_LIMITS_ATTR = "cms-limits";
const CMS_COLLECTION_ATTR = "cms-collection";
const CMS_ITEM_ATTR = "cms-item";

function fieldLimits(field: CmsField): Record<string, unknown> {
  const { kind: _kind, label: _label, ...limits } = field as CmsField&Record<string, unknown>;
  return limits;
}

function cmsFieldAttrs(address: string, field: CmsField): Record<string, string> {
  return {
    [frontendDataAttr(CMS_FIELD_ATTR)]: address,
    [frontendDataAttr(CMS_KIND_ATTR)]: field.kind,
    [frontendDataAttr(CMS_LIMITS_ATTR)]: JSON.stringify(fieldLimits(field)),
  };
}

function cmsCollectionAttrs(id: string): Record<string, string> {
  return {[frontendDataAttr(CMS_COLLECTION_ATTR)]: id };
}

function cmsItemAttrs(itemId: string): Record<string, string> {
  return {[frontendDataAttr(CMS_ITEM_ATTR)]: itemId };
}

function cmsSelectors() {
  return {
    collection: frontendDataSelector(CMS_COLLECTION_ATTR),
    field: frontendDataSelector(CMS_FIELD_ATTR),
    item: frontendDataSelector(CMS_ITEM_ATTR),
  };
}

function cmsAttrNames() {
  return {
    collection: frontendDataAttr(CMS_COLLECTION_ATTR),
    field: frontendDataAttr(CMS_FIELD_ATTR),
    item: frontendDataAttr(CMS_ITEM_ATTR),
    kind: frontendDataAttr(CMS_KIND_ATTR),
    limits: frontendDataAttr(CMS_LIMITS_ATTR),
  };
}

export { cmsAttrNames, cmsCollectionAttrs, cmsFieldAttrs, cmsItemAttrs, cmsSelectors, fieldLimits };
