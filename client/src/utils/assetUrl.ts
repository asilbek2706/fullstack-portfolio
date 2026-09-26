export function assetUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const origin = import.meta.env.DEV
      ? window.location.origin
      : new URL(
          import.meta.env.VITE_API_URL ||
            'https://api.asilbek-karomatov.dev/api',
        ).origin;
    const url = new URL(value, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
