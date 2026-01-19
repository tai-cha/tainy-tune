import type { Session, User as BaseUser } from "better-auth";

export type User = BaseUser & {
  role?: string | null;
};

/**
 * Interface definition for what we store in localStorage.
 * We wrap the session data with metadata for validation.
 */
export interface CachedSessionData {
  data: {
    session: Session;
    user: User;
  };
  cachedAt: number;
  expiresAt: number;
}

const CACHE_KEY = 'auth-session-cache';
// Fallback TTL if no expiry is provided (e.g. 7 days), though better-auth usually provides one.
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Retrieves and validates the cached session.
 * Checks structure, cachedAt, and expiresAt.
 * Returns null if invalid or expired (and clears the cache in that case).
 */
export function getCachedSession(): CachedSessionData['data'] | null {
  if (!import.meta.client) return null;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached: CachedSessionData = JSON.parse(raw);

    // Basic Structure Validation
    if (!cached.data || !cached.data.session || !cached.data.user || !cached.cachedAt || !cached.expiresAt) {
      console.warn('[SessionCache] Invalid cache structure, clearing.');
      clearCachedSession();
      return null;
    }

    const now = Date.now();

    // Expiry Validation
    if (cached.expiresAt < now) {
      console.warn('[SessionCache] Session expired, clearing.');
      clearCachedSession();
      return null;
    }

    // Sanity check: If cachedAt is in the future (clock skew?), treating as invalid might be safer, 
    // or just ignore. Let's allow a small buffer or just ignore for now to be robust against minor skew.

    return cached.data;
  } catch (e) {
    console.error('[SessionCache] Error parsing cache:', e);
    clearCachedSession();
    return null;
  }
}

/**
 *  Sanitizes and caches the session.
 *  Removes sensitive data if necessary (though better-auth client session usually doesn't have raw tokens).
 *  Sets timestamps.
 */
export function setCachedSession(data: { session: Session; user: User }) {
  if (!import.meta.client) return;
  if (!data || !data.session) return;

  try {
    const now = Date.now();
    const expiresAt = data.session.expiresAt
      ? new Date(data.session.expiresAt).getTime()
      : now + DEFAULT_TTL;

    // Clone to avoid mutating the original object if we were to delete props
    // Note: Better Auth client object usually sends a cookie-based session, 
    // so 'token' might not be here. If it is, we should remove it.
    const sessionClone = { ...data.session };
    if ('token' in sessionClone) {
      // @ts-ignore - explicitly removing token if it exists for extra safety
      delete sessionClone.token;
    }

    const cacheObject: CachedSessionData = {
      data: {
        session: sessionClone,
        user: data.user
      },
      cachedAt: now,
      expiresAt: expiresAt
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (e) {
    console.error('[SessionCache] Error setting cache:', e);
  }
}

/**
 * Clears the session cache.
 */
export function clearCachedSession() {
  if (!import.meta.client) return;
  localStorage.removeItem(CACHE_KEY);
}
