// eehu! service worker
// Caches the app shell for offline access. API requests always go to the network.

const CACHE_NAME = 'eehu-v1'
const SHELL_URLS = [
  '/',
  '/Glossy Emerald Eehu Chat icon.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Always fetch API and admin routes from the network. Never cache them.
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/admin')
  ) {
    return
  }

  // For everything else: try network first, fall back to cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache static assets (not dynamic navigations) to prevent stale HTML shells
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          !response.headers.get('content-type')?.includes('text/html')
        ) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

