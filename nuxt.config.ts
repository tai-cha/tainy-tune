import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/storybook'],
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
    // The issue is hot-reload, which is fixed by global singleton in embedding.ts
    hooks: {
      'dev:reload': () => {
        require('onnxruntime-node');
      },
    },
  },
})