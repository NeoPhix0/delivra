/**
 * Utility helpers for converting API response field names
 * API returns snake_case (e.g. full_name, created_at)
 * UI expects camelCase (e.g. fullName, createdAt)
 */

const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase());

const adaptKeys = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(adaptKeys);
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), adaptKeys(v)])
    );
  }
  return obj;
};

export { adaptKeys, toCamelCase };