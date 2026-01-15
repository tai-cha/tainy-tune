import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from '#app';
import { authClient } from '~/app/utils/auth-client';
import { getCachedSession, setCachedSession } from '~/app/utils/session-cache';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/' || to.path === '/admin/setup' || to.path === '/signup') {
    return;
  }

  // Use getSession for both Server and Client to ensure consistent validation
  // passing fetchOptions with headers is crucial for SSR to send cookies to the auth API
  let session;
  const isOffline = import.meta.client && !navigator.onLine;
  // Robust Strategy: Try Online -> Fallback to Cache
  // This handles both "Real Offline" (!navigator.onLine) and "Lie-fi" (Network Timeout/Error)

  if (import.meta.client && !navigator.onLine) {
    // Fast path for explicit offline
    const cached = getCachedSession();
    if (cached) session = cached;
  } else {
    // Online path with fallback
    try {
      const { data } = await authClient.getSession({
        fetchOptions: { headers: useRequestHeaders() as Record<string, string> }
      });
      session = data;
      if (import.meta.client && session) {
        setCachedSession(session);
      }
    } catch (e) {
      console.warn('Network check failed, checking cache:', e);
      if (import.meta.client) {
        const cached = getCachedSession();
        if (cached) session = cached;
      }
    }
  }

  if (!session) {
    return navigateTo('/login');
  }

  // Admin route protection
  if (to.path.startsWith('/admin') && to.path !== '/admin/setup') {
    // Check for admin role
    if (session.user.role !== 'admin') {
      return navigateTo('/');
    }
  }
});
