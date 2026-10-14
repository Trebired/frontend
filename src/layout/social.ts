type SiteSocialService = { icon: string; label: string };

const SITE_SOCIAL_SERVICES: Record<string, SiteSocialService> = {
  bluesky: { icon: "simple-icons:bluesky", label: "Bluesky" },
  discord: { icon: "simple-icons:discord", label: "Discord" },
  github: { icon: "simple-icons:github", label: "GitHub" },
  instagram: { icon: "simple-icons:instagram", label: "Instagram" },
  linkedin: { icon: "remixicon:linkedin-fill", label: "LinkedIn" },
  mastodon: { icon: "simple-icons:mastodon", label: "Mastodon" },
  x: { icon: "simple-icons:x", label: "X" },
  youtube: { icon: "simple-icons:youtube", label: "YouTube" },
};

function siteSocialService(service: string): SiteSocialService | null {
  return SITE_SOCIAL_SERVICES[service] || null;
}

function siteSocialIconSpecs(services: string[] = Object.keys(SITE_SOCIAL_SERVICES)): string[] {
  return services
  .map((service) => siteSocialService(service)?.icon || "")
  .filter((spec) => spec.length > 0);
}

export { SITE_SOCIAL_SERVICES, siteSocialIconSpecs, siteSocialService };
export type { SiteSocialService };
