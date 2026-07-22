export function buildSelfUrl(
  imagePath?: string | null,
  baseUrl?: string,
): string | null {
  if (!imagePath) {
    return null;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (baseUrl) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}${normalizedPath}`;
  }

  return normalizedPath;
}

export function getBaseUrlFromRequest(req: any): string {
  if (!req) return '';
  const host = req.headers?.host || req.hostname || 'localhost:3000';
  const protocol = req.protocol || req.headers?.['x-forwarded-proto'] || 'http';
  return `${protocol}://${host}`;
}
