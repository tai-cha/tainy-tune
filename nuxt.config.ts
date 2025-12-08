// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils'],
  typescript: {
    tsConfig: {
      compilerOptions: {
        esModuleInterop: true,
      },
    },
  },
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          esModuleInterop: true,
        },
      },
    },
    // Fix for native modules: Allow nitro to handle them, but bundle transformers
    // The issue is hot-reload, which is fixed by global singleton in embedding.ts
    externals: {
      inline: ['@xenova/transformers'],
    },
  },
})