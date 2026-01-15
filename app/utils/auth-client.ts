import { createAuthClient } from "better-auth/vue";
import { adminClient } from "better-auth/client/plugins";
import { getCachedSession, clearCachedSession } from '~/app/utils/session-cache';

export const authClient = createAuthClient({
    baseURL: import.meta.env.SSR ? process.env.BETTER_AUTH_URL : undefined,
    plugins: [
        adminClient()
    ]
});

import { computed, ref, onMounted, getCurrentInstance } from "vue";
import { useOnline } from '@vueuse/core';

const { signIn, signOut: originalSignOut } = authClient;

// Wrap signOut to clear cache
export const signOut = async (options?: any) => {
    clearCachedSession();
    return originalSignOut(options);
};

export { signIn };

export const useSession = () => {
    const original = authClient.useSession();
    const isOnline = useOnline();
    const offlineData = ref(null);

    if (import.meta.client) {
        const loadCache = () => {
            const cached = getCachedSession();
            if (cached) {
                // @ts-ignore - mismatch between inferred Session and our manual type might exist, but structure is compatible
                offlineData.value = cached;
            }
        };

        if (getCurrentInstance()) {
            onMounted(loadCache);
        } else {
            setTimeout(loadCache, 0);
        }
    }

    return computed(() => {
        // STRICT RULE: If Online, ALWAYS trust the server (original).
        // If server says "null" (logged out), we return null.
        // We only failover to cache if we are explicitly OFFLINE.
        if (isOnline.value) {
            return original.value;
        }

        // Offline Mode: Use cache if available
        if (offlineData.value) {
            return {
                data: offlineData.value,
                isPending: false,
                error: null
            };
        }

        return original.value;
    });
};