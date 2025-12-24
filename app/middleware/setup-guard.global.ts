export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip during SSR to avoid hydration mismatches or double fetches if not needed?
  // Actually we need to protect SSR too.

  const { data: adminStatus, error } = await useFetch('/api/auth/has-admin', {
    key: 'admin-status',
    // Cache this result for a while or checking every navigation?
    // Since this status rarely changes (only once), we can cache it.
    // However, if we finish setup, we need to refresh this.
  });

  if (error.value) {
    console.error("Failed to check admin status", error.value);
    return;
  }

  const hasAdmin = adminStatus.value?.hasAdmin;
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
