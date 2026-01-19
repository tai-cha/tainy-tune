export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip during SSR to avoid hydration mismatches or double fetches if not needed?
  // Actually we need to protect SSR too.

  // Check cache first or skip if offline to avoid blocking app load
  // If we can't reach server, we shouldn't redirect to setup?
  // Assume generic "hasAdmin=true" if offline/error to allow other guards to handle auth?

  let hasAdmin = true; // Default assumption to avoid blocking
  if (import.meta.client && !navigator.onLine) {
    // Offline: Skip check
  } else {
    try {
      const { data, error } = await useFetch('/api/auth/has-admin', {
        key: 'admin-status',
        retry: 0 // Don't retry indefinitely
      });
      if (!error.value && data.value) {
        hasAdmin = data.value.hasAdmin;
      }
    } catch (e) {
      console.warn('Setup check failed', e);
    }
  }

  // Rewrite logic to use local 'hasAdmin' variable
  /* 
  if (error.value) { ... } -> Removed 
  */

  const isSetupPage = to.path === '/admin/setup';

  if (!hasAdmin) {
    if (!isSetupPage) {
      return navigateTo('/admin/setup');
    }
  } else {
    // Admin exists
    if (isSetupPage) {
      return navigateTo('/');
    }
  }
});
