import { parseTextDocument } from "./../text-document.js";
import type { TextDocument } from "./../text-document.js";
import type { BuildDataContext, BuildDataResult, BuildDataSource } from "./types.js";

type TextDocumentsOptions = {
  branch?: string;
  langs: string[];
  org: string;
  repo: string;
  slugs: string[];
  timeout?: number;
};

type TextDocuments = Record<string, Record<string, TextDocument>>;

const DEFAULT_BRANCH = "main";
const DEFAULT_TIMEOUT = 15000;

function agent(org: string): string {
  return `${org}-site-build`;
}

function documentUrl(options: TextDocumentsOptions, ref: string, slug: string, lang: string): string {
  return `https://raw.githubusercontent.com/${options.org}/${options.repo}/${ref}/${slug}/${lang}.md`;
}

async function resolveCommit(options: TextDocumentsOptions): Promise<string> {
  const branch = options.branch || DEFAULT_BRANCH;
  const url = `https://api.github.com/repos/${options.org}/${options.repo}/commits/${branch}`;
  const response = await fetch(url, {
      headers: { "accept": "application/vnd.github+json", "user-agent": agent(options.org) },
      signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT),
  });
  if (!response.ok) throw new Error(`github responded ${response.status} for ${options.org}/${options.repo}`);
  const payload = await response.json() as { sha?: string };
  const sha = String(payload.sha || "").trim();
  if (!sha) throw new Error(`github returned no commit for ${options.org}/${options.repo}`);
  return sha;
}

async function requestDocument(
  options: TextDocumentsOptions,
  ref: string,
  slug: string,
  lang: string,
): Promise<TextDocument|null> {
  try {
    const response = await fetch(documentUrl(options, ref, slug, lang), {
        signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT),
    });
    if (!response.ok) return null;
    return parseTextDocument(await response.text());
  } catch {
    return null;
  }
}

function missingFrom(options: TextDocumentsOptions, documents: TextDocuments): string[] {
  const missing: string[] = [];
  for (const slug of options.slugs) {
    for (const lang of options.langs) {
      if (!documents[slug]?.[lang]) missing.push(`${slug}/${lang}`);
    }
  }
  return missing;
}

async function readDocuments(
  options: TextDocumentsOptions,
  context: BuildDataContext,
): Promise<BuildDataResult<TextDocuments>> {
  const stored = (context.cached || {}) as TextDocuments;
  const commit = await resolveCommit(options);
  const documents: TextDocuments = {};
  let fetched = 0;

  for (const slug of options.slugs) {
    for (const lang of options.langs) {
      const live = await requestDocument(options, commit, slug, lang);
      if (live) fetched += 1;
      const document = live || stored[slug]?.[lang];
      if (!document) continue;
      documents[slug] = documents[slug] || {};
      documents[slug][lang] = document;
    }
  }

  if (fetched === 0) throw new Error(`no document was read from ${options.org}/${options.repo}`);
  const missing = missingFrom(options, documents);
  if (missing.length > 0) throw new Error(`no document available for ${missing.join(", ")}`);
  const kept = options.slugs.length * options.langs.length - fetched;
  const detail = kept > 0 ? `, ${kept} kept` : "";
  return {
    detail: `${fetched} documents from ${options.org}/${options.repo}@${commit.slice(0, 7)}${detail}`,
    value: documents,
  };
}

function textDocumentsSource(options: TextDocumentsOptions): BuildDataSource<TextDocuments> {
  return { fetch: (context) => readDocuments(options, context) };
}

export { textDocumentsSource };
export type { TextDocuments, TextDocumentsOptions };
