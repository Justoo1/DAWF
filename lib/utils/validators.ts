/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Prisma string IDs in this project use `@default(cuid())` (and sometimes UUID in legacy data).
 * Do not use `isValidUUID` alone for vendor/menu/food/user IDs — it will reject valid cuids.
 */
export function isValidPrismaId(id: string | null | undefined): boolean {
  if (id == null || typeof id !== 'string') return false;
  const t = id.trim();
  if (t.length < 8 || t.length > 128) return false;
  if (isValidUUID(t)) return true;
  // Classic cuid() from Prisma — 25 chars, starts with 'c'
  if (/^c[a-z0-9]{24}$/i.test(t)) return true;
  // CUID2-style ids (alphanumeric, first char letter)
  if (/^[a-z][a-z0-9]{20,31}$/i.test(t)) return true;
  return false;
}

/**
 * Validate and sanitize user input text to prevent XSS
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  // Basic sanitization - remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}
