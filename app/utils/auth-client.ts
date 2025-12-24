import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    // baseURL is inferred from current origin, or uses relative path '/api/auth'
});

export const { signIn, signOut, useSession } = authClient;