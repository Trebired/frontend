import { frontendToken } from "./../namespace/index.js";
import type { CmsDocument } from "./document.js";
import type { CmsValue } from "./values.js";

const CMS_CHANNEL = frontendToken("cms");
const CMS_EDIT_PARAM = frontendToken("cms-edit");

type CmsFieldReport = { address: string; kind: string; limits: Record<string, unknown> };
type CmsCollectionReport = { id: string; items: string[] };

type CmsParentMessage =
| { document: CmsDocument; type: "document" }
| { address: string; type: "focus" }
| { nonce: string; type: "hello" }
| { all: boolean; type: "outline" };

type CmsSiteMessage =
| { address: string; type: "change"; value: CmsValue }
| { collections: CmsCollectionReport[]; fields: CmsFieldReport[]; locale: string; nonce: string; path: string; type: "ready" }
| { address: string; kind: string; limits: Record<string, unknown>; type: "select" };

type CmsEnvelope<T> = T& { channel: string };

function cmsEnvelope<T extends{type:string}>(message: T): CmsEnvelope<T> {
  return { ...message, channel: CMS_CHANNEL };
}

function isCmsMessage(data: unknown): data is CmsEnvelope<{type:string}> {
  return Boolean(data) && typeof data === "object" && (data as { channel?: unknown }).channel === CMS_CHANNEL;
}

function fieldAddress(collection: string, itemId: string, key: string): string {
  return `${collection}/${itemId}/${key}`;
}

function parseAddress(address: string): { collection: string; field: string; item: string } | { field: string } {
  const parts = address.split("/");
  if (parts.length === 3) return { collection: parts[0] as string, field: parts[2] as string, item: parts[1] as string };
  return { field: address };
}

export { CMS_CHANNEL, CMS_EDIT_PARAM, cmsEnvelope, fieldAddress, isCmsMessage, parseAddress };
export type { CmsCollectionReport, CmsEnvelope, CmsFieldReport, CmsParentMessage, CmsSiteMessage };
