const browserOrigin = typeof globalThis.location === 'undefined' ? '' : globalThis.location.origin;
const browserPort = typeof globalThis.location === 'undefined' ? '' : globalThis.location.port;

export const APPWRITE_ENDPOINT =
  browserPort === '4200' ? `${browserOrigin}/v1` : 'http://localhost/v1';
export const APPWRITE_PROJECT_ID = '6a956c6d0038a1f7b9cb';
export const APPWRITE_DATABASE_ID = '6a956d9a0006188dc2cc';
