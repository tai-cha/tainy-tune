/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import type { RouteHandlerCallbackOptions } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import type { PrecacheEntry } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | PrecacheEntry)[] }

// Take control immediately
self.skipWaiting()
clientsClaim()

// Precache resources injection point
// This will be replaced by the list of assets during build
// We explicitly add offline.html here via additionalManifestEntries in config
precacheAndRoute(self.__WB_MANIFEST)

// Clean old caches
cleanupOutdatedCaches()

// 1. Audio Cache (CacheFirst)
registerRoute(
  /^.*\/sounds\/.*$/,
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  })
)

// 2. API Cache (NetworkFirst)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v3',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 1 Day
      }),
    ],
  }),
  'GET'
)


// 3. Navigation (Pages) Handler with Offline Fallback
// This is the core logic: Try Network -> Try Cache -> Show Offline Page
const navigationHandler = async (params: RouteHandlerCallbackOptions) => {
  try {
    // Try Network First
    return await new NetworkFirst({
      cacheName: 'pages-cache-v3',
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
        }),
      ],
    }).handle(params)
  } catch (error) {
    // If network fails (and cache is empty/stale), catch here
    // But NetworkFirst usually returns cache if network fails.
    // It throws only if BOTH fail.

    // Fallback to offline.html
    const fallback = await createHandlerBoundToURL('/offline.html')
    return await fallback(params)
  }
}

// Register the navigation route (handling all page navigations)
registerRoute(
  new NavigationRoute(navigationHandler)
)

// 4. Other Assets (StaleWhileRevalidate)
registerRoute(
  /\.(?:js|css|html|png|svg|ico)$/,
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
)
