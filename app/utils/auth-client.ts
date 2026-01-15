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
import type { CachedSessionData } from '~/app/utils/session-cache';

const { signIn, signOut: originalSignOut } = authClient;

// Wrap signOut to clear cache
export const signOut = async (options?: any) => {
    clearCachedSession();
    return originalSignOut(options);
};

export { signIn };

export type SessionData = CachedSessionData['data'];

export const useSession = () => {
    const original = authClient.useSession();
    const isOnline = useOnline();
    const offlineData = ref<SessionData | null>(null);

    if (import.meta.client) {
        const loadCache = () => {
            const cached = getCachedSession();
            if (cached) {
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
        if (isOnline.value) {
            // Check if original.value already matches the shape { data, isPending, error }
            if (original.value && 'data' in original.value) {
                return original.value as {
                    data: SessionData | null;
                    isPending: boolean;
                    error: any;
                };
            }
            // If it's the raw session object (in case better-auth behavior changes or inference is weird), wrap it.
            return {
                data: original.value as SessionData | null,
                isPending: false,
                error: null
            };
        }

        // Offline Mode: Use cache if available
        if (offlineData.value) {
            return {
                data: offlineData.value,
                isPending: false,
                error: null
            };
        }

        // Default fallback (offline execution but no cache)
        return {
            data: null,
            isPending: false,
            error: null
        };
    });
};