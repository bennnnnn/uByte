const CACHE = "ubyte-v2";
const SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res.ok && (request.mode === "navigate" || url.pathname.startsWith("/_next/static/"))) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
      return url.pathname.startsWith("/_next/static/") && cached ? cached : network.catch(() => cached);
    })
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener("push", (e) => {
  if (!e.data) return;

  let payload;
  try {
    payload = e.data.json();
  } catch {
    payload = { title: "uByte", body: e.data.text() };
  }

  const title   = payload.title ?? "uByte";
  const options = {
    body:    payload.body  ?? "",
    icon:    payload.icon  ?? "/icon-192.png",
    badge:   "/icon-192.png",
    data:    { url: payload.url ?? "/" },
    vibrate: [200, 100, 200],
    tag:     payload.tag ?? "ubyte-notification",
    renotify: true,
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

// When the user taps the notification, open/focus the relevant page.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) ? e.notification.data.url : "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
