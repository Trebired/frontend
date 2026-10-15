import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type { BuildDataAsset, BuildDataContext, BuildDataResult, BuildDataSource } from "./types.js";

type GravatarPerson = {
  email: string;
  role: string;
};

type GravatarSourceOptions = {
  people: GravatarPerson[];
  size?: number;
  timeout?: number;
  userAgent?: string;
};

type GravatarLink = {
  label: string;
  service: string;
  url: string;
};

type GravatarProfile = {
  accounts: GravatarLink[];
  avatar: string;
  bio: string;
  jobTitle: string;
  links: GravatarLink[];
  location: string;
  name: string;
  profileUrl: string;
  role: string;
};

type GravatarAccount = {
  display?: string;
  is_hidden?: boolean;
  name?: string;
  shortname?: string;
  url?: string;
};

type GravatarEntry = {
  aboutMe?: string;
  accounts?: GravatarAccount[];
  currentLocation?: string;
  displayName?: string;
  job_title?: string;
  profileUrl?: string;
  urls?: { title?: string; value?: string }[];
};

const DEFAULT_SIZE = 400;
const DEFAULT_TIMEOUT = 15000;
const DEFAULT_AGENT = "trebired-site-build";

function profileHash(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function avatarPath(hash: string): string {
  return `people/${hash}.jpg`;
}

function linkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host.replace(/^www\./u, "")}${parsed.pathname.replace(/\/$/u, "")}`;
  } catch {
    return "";
  }
}

function entryLinks(entry: GravatarEntry): GravatarLink[] {
  return (entry.urls || [])
  .map((link) => ({ label: String(link.title || "").trim(), service: "", url: String(link.value || "").trim() }))
  .filter((link) => link.url)
  .map((link) => ({ ...link, label: link.label || linkLabel(link.url) }));
}

function entryAccounts(entry: GravatarEntry): GravatarLink[] {
  return (entry.accounts || [])
  .filter((account) => !account.is_hidden && account.url)
  .map((account) => ({
        label: String(account.name || account.display || "").trim() || linkLabel(String(account.url)),
        service: String(account.shortname || account.name || "").trim(),
        url: String(account.url || "").trim(),
  }));
}

async function requestEntry(options: GravatarSourceOptions, hash: string): Promise<GravatarEntry|null> {
  try {
    const response = await fetch(`https://gravatar.com/${hash}.json`, {
        headers: { "user-agent": options.userAgent || DEFAULT_AGENT },
        signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { entry?: GravatarEntry[] };
    return payload.entry?.[0] || null;
  } catch {
    return null;
  }
}

async function cacheFile(context: BuildDataContext, hash: string): Promise<string> {
  return path.join(context.dir || ".", context.name || "people", `${hash}.jpg`);
}

async function readCachedAvatar(context: BuildDataContext, hash: string): Promise<Uint8Array|null> {
  try {
    return await fs.readFile(await cacheFile(context, hash));
  } catch {
    return null;
  }
}

async function avatarBytes(
  options: GravatarSourceOptions,
  context: BuildDataContext,
  hash: string,
): Promise<Uint8Array|null> {
  const size = options.size || DEFAULT_SIZE;
  try {
    const response = await fetch(`https://gravatar.com/avatar/${hash}?s=${size}&d=404`, {
        headers: { "user-agent": options.userAgent || DEFAULT_AGENT },
        signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT),
    });
    if (!response.ok) return await readCachedAvatar(context, hash);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const file = await cacheFile(context, hash);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, bytes);
    return bytes;
  } catch {
    return await readCachedAvatar(context, hash);
  }
}

async function profileFor(
  options: GravatarSourceOptions,
  context: BuildDataContext,
  person: GravatarPerson,
  assets: BuildDataAsset[],
): Promise<GravatarProfile|null> {
  const hash = profileHash(person.email);
  const entry = await requestEntry(options, hash);
  if (!entry) return null;
  const bytes = await avatarBytes(options, context, hash);
  if (bytes) assets.push({ contents: bytes, path: avatarPath(hash) });
  return {
    accounts: entryAccounts(entry),
    avatar: bytes ? `/${avatarPath(hash)}` : "",
    bio: String(entry.aboutMe || "").trim(),
    jobTitle: String(entry.job_title || "").trim(),
    links: entryLinks(entry),
    location: String(entry.currentLocation || "").trim(),
    name: String(entry.displayName || "").trim(),
    profileUrl: String(entry.profileUrl || "").trim(),
    role: person.role,
  };
}

async function keptProfile(
  context: BuildDataContext,
  person: GravatarPerson,
  stored: GravatarProfile | undefined,
  assets: BuildDataAsset[],
): Promise<GravatarProfile|null> {
  if (!stored) return null;
  const hash = profileHash(person.email);
  const bytes = await readCachedAvatar(context, hash);
  if (bytes) assets.push({ contents: bytes, path: avatarPath(hash) });
  return { ...stored, avatar: bytes ? `/${avatarPath(hash)}` : "" };
}

async function readProfiles(
  options: GravatarSourceOptions,
  context: BuildDataContext,
): Promise<BuildDataResult<GravatarProfile[]>> {
  const stored = Array.isArray(context.cached) ? context.cached as GravatarProfile[] : [];
  const assets: BuildDataAsset[] = [];
  const people: GravatarProfile[] = [];
  let fetched = 0;

  for (const [index, person] of options.people.entries()) {
    const live = await profileFor(options, context, person, assets);
    if (live) fetched += 1;
    const profile = live || await keptProfile(context, person, stored[index], assets);
    if (profile) people.push(profile);
  }

  if (people.length === 0) throw new Error("gravatar returned no profile");
  const kept = people.length - fetched;
  const links = people.reduce((total, person) => total + person.links.length + person.accounts.length, 0);
  const detail = `${fetched} profiles, ${assets.length} avatars, ${links} links${kept > 0 ? `, ${kept} kept` : ""}`;
  return { assets, detail, value: people };
}

function gravatarProfilesSource(options: GravatarSourceOptions): BuildDataSource<GravatarProfile[]> {
  return { fetch: (context) => readProfiles(options, context) };
}

export { gravatarProfilesSource, profileHash };
export type { GravatarLink, GravatarPerson, GravatarProfile, GravatarSourceOptions };
