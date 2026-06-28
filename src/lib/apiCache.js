/**
 * apiCache.js — Session-scoped fetch cache with TTL
 *
 * Wraps fetch() calls so that responses are stored in sessionStorage.
 * The data is reused until it expires (TTL), avoiding repeat DB hits
 * on page navigations and soft reloads within the same browser tab.
 *
 * Usage:
 *   import { cachedFetch, invalidateCache } from '@/lib/apiCache';
 *
 *   // Fetch with 5-minute TTL (default)
 *   const data = await cachedFetch('/api/admin/stats');
 *
 *   // Fetch with custom 30-second TTL
 *   const data = await cachedFetch('/api/admin/stats', {}, 30);
 *
 *   // Invalidate a cached key (call after mutations)
 *   invalidateCache('/api/tailor/orders');
 */

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

/**
 * Returns a cached value from sessionStorage if present and not expired.
 * @param {string} key - The cache key (usually the URL).
 * @returns {any|null} Parsed cached value or null if missing/expired.
 */
function getFromCache(key) {
  try {
    const raw = sessionStorage.getItem(`api_cache:${key}`);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(`api_cache:${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Stores a value in sessionStorage with an expiry timestamp.
 * @param {string} key - The cache key.
 * @param {any} data - The data to store (must be JSON-serialisable).
 * @param {number} ttlSeconds - Seconds until expiry.
 */
function setInCache(key, data, ttlSeconds) {
  try {
    sessionStorage.setItem(
      `api_cache:${key}`,
      JSON.stringify({ data, expiresAt: Date.now() + ttlSeconds * 1000 })
    );
  } catch {
    // Silently ignore storage quota errors — just skip caching.
  }
}

/**
 * Fetch wrapper that uses sessionStorage to avoid repeat DB hits.
 *
 * @param {string} url - The API URL to fetch.
 * @param {RequestInit} [options={}] - Optional fetch options (method, headers, body…).
 *   NOTE: Only GET requests are cached; any other method bypasses the cache.
 * @param {number} [ttlSeconds=DEFAULT_TTL_SECONDS] - Cache lifetime in seconds.
 * @returns {Promise<any>} The parsed JSON response data.
 */
export async function cachedFetch(url, options = {}, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  // Only cache GET requests.
  if (isGet) {
    const cached = getFromCache(url);
    if (cached !== null) {
      return cached;
    }
  }

  const res = await fetch(url, { ...options, cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${url}`);
  }

  const json = await res.json();

  if (isGet) {
    setInCache(url, json, ttlSeconds);
  }

  return json;
}

/**
 * Remove a specific cache entry (call after a successful POST/PATCH/DELETE).
 * @param {string} url - The cache key URL to invalidate.
 */
export function invalidateCache(url) {
  try {
    sessionStorage.removeItem(`api_cache:${url}`);
  } catch {
    // no-op
  }
}

/**
 * Remove all api_cache:* entries from sessionStorage.
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(sessionStorage).filter((k) => k.startsWith('api_cache:'));
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // no-op
  }
}
