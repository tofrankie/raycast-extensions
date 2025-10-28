export function transformURL(url: string, params: Record<string, string | number>): string {
  return url.replace(/\{(\w+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`;
  });
}
