// TEAM MTO Service Worker — キャッシュ戦略: Network First（常に最新を優先、オフライン時はキャッシュ）
const CACHE = 'tmto-v1'
const OFFLINE_URLS = ['/team-mto-demo/', '/team-mto-demo/index.html']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Google Fonts / CDN はキャッシュしない
  if (!e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
