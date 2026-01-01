import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from '#app';
import { authClient } from '~/app/utils/auth-client';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/' || to.path === '/admin/setup' || to.path === '/signup') {
    return;
  }

  // Use getSession for both Server and Client to ensure consistent validation
  // passing fetchOptions with headers is crucial for SSR to send cookies to the auth API
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: useRequestHeaders() as Record<string, string>
    }
  });

  if (!session) {
    return navigateTo('/login');
  }

  // Admin route protection
  if (to.path.startsWith('/admin') && to.path !== '/admin/setup') {
    if (session.user.role !== 'admin') {
      return navigateTo('/');
    }
  }
});
