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
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-title', content: 'Tainy Tune' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/pwa-192x192.png' },
      ],
      title: 'Tainy Tune', // Browser Tab Title
    },
  },

  css: ['~/app/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
  i18n: {
    vueI18n: './i18n.config.ts', // optional, for legacy
    locales: [
      { code: 'ja', file: 'ja.json' }
    ],
    langDir: 'locales',
    defaultLocale: 'ja',
    strategy: 'no_prefix', // Keep URLs simple for now
  },
  pwa: {
    manifest: {
      name: 'Tainy Tune',
      short_name: 'TainyTune',
      description: 'Your AI Mental Care Partner',
      theme_color: '#ffffff',
      display: 'standalone',
      background_color: '#ffffff',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
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
  runtimeConfig: {
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    },
  },
})