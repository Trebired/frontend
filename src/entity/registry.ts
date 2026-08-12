import {
  mergeIconAliases,
  normalizeIconAliasSpec,
  type IconAliasMap,
} from "#rqcj8y6keks2";

type EntityRegistryEntry = {
  aliases?: readonly unknown[];
  icon?: unknown;
};

type EntityRegistryInput = Record<string, EntityRegistryEntry|null|undefined>;

function normalizeEntityKey(value: unknown) {
  return String(value == null ? "" : value)
  .trim()
  .toLowerCase()
  .replace(/-/gu, "_");
}

function entityKeyCandidates(value: unknown) {
  const key = normalizeEntityKey(value);
  if (!key) return [];

  const candidates = new Set<string>();
  candidates.add(key);

  if (!key.endsWith("s")) candidates.add(`${key}s`);
  if (!key.endsWith("es")) candidates.add(`${key}es`);
  if (key.endsWith("ies") && key.length > 3) {
    candidates.add(`${key.slice(0, -3)}y`);
  }
  if (key.endsWith("y")) candidates.add(`${key.slice(0, -1)}ies`);
  if (key.endsWith("es") && key.length > 2) candidates.add(key.slice(0, -2));
  if (key.endsWith("s") && key.length > 1) candidates.add(key.slice(0, -1));

  return Array.from(candidates).filter(Boolean);
}

function entityKeySet(name: unknown, entity: EntityRegistryEntry | null | undefined) {
  const keys = new Set<string>();
  const nameKey = normalizeEntityKey(name);
  if (nameKey) keys.add(nameKey);
  const aliases = Array.isArray(entity?.aliases) ? entity.aliases : [];
  for (const alias of aliases) {
    const key = normalizeEntityKey(alias);
    if (key) keys.add(key);
  }
  return keys;
}

function createEntityIconAliasMap(entities: EntityRegistryInput): IconAliasMap {
  const out: IconAliasMap = {};
  for (const [name, entity] of Object.entries(entities || {})) {
    const spec = normalizeIconAliasSpec(entity?.icon);
    if (!spec) continue;
    for (const key of entityKeySet(name, entity)) out[key] = spec;
  }
  return out;
}

function resolveEntityRegistryName(
  entities: EntityRegistryInput,
  value: unknown,
) {
  const candidates = entityKeyCandidates(value);
  if (!candidates.length) return "";

  for (const [name, entity] of Object.entries(entities || {})) {
    const keys = entityKeySet(name, entity);
    if (candidates.some((candidate) => keys.has(candidate))) {
      return normalizeEntityKey(name);
    }
  }

  return "";
}

function resolveEntityIconSpec(entities: EntityRegistryInput, value: unknown) {
  const map = createEntityIconAliasMap(entities);
  for (const candidate of entityKeyCandidates(value)) {
    const spec = map[candidate];
    if (spec) return spec;
  }
  return "";
}

function mergeEntityIconAliases(
  entities: EntityRegistryInput,
  ...aliases: unknown[]
) {
  return mergeIconAliases(createEntityIconAliasMap(entities), ...aliases);
}

export {
  createEntityIconAliasMap,
  entityKeyCandidates,
  mergeEntityIconAliases,
  normalizeEntityKey,
  resolveEntityIconSpec,
  resolveEntityRegistryName,
};
export type { EntityRegistryEntry, EntityRegistryInput };
