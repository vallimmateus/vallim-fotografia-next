/**
 * Creates a URL-friendly slug from a given name.
 *
 * This function converts the input string to lowercase, removes diacritical marks,
 * replaces non-alphanumeric characters (except spaces) with an empty string,
 * and replaces spaces with hyphens.
 *
 * @param name - The input string to be converted into a slug.
 * @returns A URL-friendly slug.
 */
export default function createSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .replaceAll(' ', '-')
}
