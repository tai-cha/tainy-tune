import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@server': fileURLToPath(new URL('./server', import.meta.url)),
    '@app': fileURLToPath(new URL('./app', import.meta.url)),
    '~': fileURLToPath(new URL('./', import.meta.url)),
  },
  compatibilityDate: '2025-07-15',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  devtools: { enabled: true },
  css: ['~/app/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/i18n'],
  i18n: {
    vueI18n: './i18n.config.ts', // optional, for legacy
    locales: [
      { code: 'ja', file: 'ja.json' }
    ],
    langDir: 'locales',
    defaultLocale: 'ja',
    strategy: 'no_prefix', // Keep URLs simple for now
  },
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