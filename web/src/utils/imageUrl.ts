const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getFullUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  console.log("Construindo URL completa para:", { path, fullUrl: `${API_URL}${path}` });
  return `${API_URL}${path}`;
}