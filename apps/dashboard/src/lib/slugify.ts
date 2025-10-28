/**
 * Generate a URL-friendly slug from a string
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Removes consecutive hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')        // Remove non-word chars (except hyphens)
    .replace(/--+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}

