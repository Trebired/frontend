import { toString } from "#21h9o6s9g3d1";

type ProductIdentityOptions = {
  fallbackName?: unknown;
  hiddenDir?: unknown;
  name?: unknown;
  progressStyleId?: unknown;
  repositoryIdeMessage?: unknown;
  repositoryIdeMessageType?: unknown;
  slug?: unknown;
  themeHeaderName?: unknown;
  themeSyncChannel?: unknown;
  themeSyncMessage?: unknown;
  themeSyncMessageType?: unknown;
  themeSyncStorageKey?: unknown;
  workflowsDir?: unknown;
};

type ProductIdentity = Readonly<{
  hiddenDir: string;
  name: string;
  progressStyleId: string;
  repositoryIdeMessageType: string;
  slug: string;
  themeHeaderName: string;
  themeSyncChannel: string;
  themeSyncMessageType: string;
  themeSyncStorageKey: string;
  workflowsDir: string;
}>;

function slugText(value: unknown, fallback = "product") {
  return (
    toString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || toString(fallback, "product")
  );
}

function messageType(scope: string, kind: unknown, fallback: string) {
  const safeKind = slugText(kind, fallback);
  return `${scope}:${safeKind}`;
}

function createProductIdentity(
  options: ProductIdentityOptions = {},
): ProductIdentity {
  const name = toString(options.name, options.fallbackName || "Product") || "Product";
  const slug = slugText(options.slug, slugText(name));

  return Object.freeze({
      hiddenDir: toString(options.hiddenDir) || `.${slug}`,
      name,
      progressStyleId: toString(options.progressStyleId) || `${slug}-progress-style`,
      repositoryIdeMessageType:
      toString(options.repositoryIdeMessageType) ||
        messageType(slug, options.repositoryIdeMessage, "repository-ide"),
      slug,
      themeHeaderName: toString(options.themeHeaderName) || `x-${slug}-theme`,
      themeSyncChannel: toString(options.themeSyncChannel) || `${slug}-theme`,
      themeSyncMessageType:
      toString(options.themeSyncMessageType) ||
        messageType(slug, options.themeSyncMessage, "theme"),
      themeSyncStorageKey:
      toString(options.themeSyncStorageKey) || `${slug}:theme-sync`,
      workflowsDir: toString(options.workflowsDir) || `.${slug}/workflows`,
  });
}

export { createProductIdentity, slugText };
export type { ProductIdentity, ProductIdentityOptions };
