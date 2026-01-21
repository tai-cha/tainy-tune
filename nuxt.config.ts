import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { createHash, randomUUID } from 'crypto';

const require = createRequire(import.meta.url);

const getOfflineRevision = () => {
  try {
    const filePath = fileURLToPath(new URL('./public/offline.html', import.meta.url));
    if (existsSync(filePath)) {
      return createHash('md5').update(readFileSync(filePath)).digest('hex');
    }
  } catch { }
  return randomUUID();
};

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
        { rel: 'prefetch', href: '/offline.html' },
      ],
      title: 'Tainy Tune', // Browser Tab Title
    },
  },

  css: ['~/app/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
  i18n: {
    locales: [
      { code: 'ja' }
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix'
  },
  pwa: {
    strategies: 'injectManifest',
    filename: 'service-worker.ts',
    includeAssets: ['offline.html'],
    srcDir: '.',
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
      // Force include offline.html with a unique revision
      additionalManifestEntries: [
        { url: '/offline.html', revision: getOfflineRevision() }
      ],
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        esModuleInterop: true,
        lib: ['ESNext', 'DOM', 'WebWorker'],
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
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    // The issue is hot-reload, which is fixed by global singleton in embedding.ts
    hooks: {
      'dev:reload': () => {
        require('onnxruntime-node');
      },
      close: async () => {
        const { cpSync, existsSync, mkdirSync } = await import('fs');
        const { resolve, dirname, join } = await import('path');

        // 1. Copy Migrations
        const src = resolve(process.cwd(), 'server/db/migrations');
        const dest = resolve(process.cwd(), '.output/server/migrations');
        if (existsSync(src) && existsSync(resolve(process.cwd(), '.output/server'))) {
          cpSync(src, dest, { recursive: true });
        }

        // 2. Copy Embedding Worker Script
        const workerSrc = resolve(process.cwd(), 'server/utils/embedding-worker.mjs');
        const workerDestDir = resolve(process.cwd(), '.output/server/utils');
        const workerDest = join(workerDestDir, 'embedding-worker.mjs');

        if (existsSync(workerSrc) && existsSync(resolve(process.cwd(), '.output/server'))) {
          if (!existsSync(workerDestDir)) {
            mkdirSync(workerDestDir, { recursive: true });
          }
          cpSync(workerSrc, workerDest);
        }

        // 3. Copy Worker Dependencies (Manually handling pnpm symlinks for standalone script)
        // Since the worker is not bundled, we need its dependencies in node_modules
        const depsToCopy = ['@xenova/transformers', 'onnxruntime-node'];
        const outputNodeModules = resolve(process.cwd(), '.output/server/node_modules');

        for (const pkg of depsToCopy) {
          try {
            // Resolve package root via package.json to handle symlinks correctly
            const pkgJsonPath = require.resolve(`${pkg}/package.json`);
            const pkgRoot = dirname(pkgJsonPath);
            const destPath = join(outputNodeModules, pkg);

            if (!existsSync(dirname(destPath))) {
              mkdirSync(dirname(destPath), { recursive: true });
            }

            // Dereference symlinks to ensure we copy actual files
            cpSync(pkgRoot, destPath, { recursive: true, dereference: true });
            console.log(`✅  Copied worker dependency: ${pkg}`);
          } catch (e) {
            console.warn(`⚠️  Failed to copy worker dependency ${pkg}:`, e);
          }
        }
      }
    },
  },
  runtimeConfig: {
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    },
  },
})