const CACHE_NAME = 'wochenplan-offline-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// Network-first für Navigationen: die Home-Bildschirm-App bekommt bei jedem
// Öffnen mit Netzverbindung garantiert die neueste index.html, unabhängig
// vom Hosting. Nur bei fehlender Verbindung greift der Offline-Fallback.
self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(function(res) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, copy); });
          return res;
        })
        .catch(function() { return caches.match(e.request); })
    );
  }
});

self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  var title = data.title || '💭 Neuer Gedanke';
  var body  = data.body  || '';
  var count = data.count;

  var tasks = [
    self.registration.showNotification(title, {
      body: body,
      icon: './apple-touch-icon.png',
      badge: './apple-touch-icon.png'
    })
  ];

  if (typeof count === 'number' && 'setAppBadge' in self.registration) {
    tasks.push(
      count > 0 ? self.registration.setAppBadge(count) : self.registration.clearAppBadge()
    );
  }

  e.waitUntil(Promise.all(tasks));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./'));
});
