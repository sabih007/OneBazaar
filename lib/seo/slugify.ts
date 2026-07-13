/** Kebab-cases a title and appends a short id suffix so listing slugs stay unique. */
export function slugifyTitle(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");

  const suffix = id.replace(/-/g, "").slice(0, 8);
  return `${base}-${suffix}`;
}
