const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getFullUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}