/* ===================================================
   Machine Gym — Service Worker (Web Push + Cache)
   =================================================== */

const CACHE_NAME = "mg-cache-v1";

// ──────────────────────────────────────────────────────
//  Install & Activate
// ──────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ──────────────────────────────────────────────────────
//  Push Event — gelen bildirimi göster
// ──────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Machine Gym", body: event.data ? event.data.text() : "" };
  }

  const title   = data.title || "Machine Gym";
  const options = {
    body:    data.body    || "",
    icon:    data.icon    || "/icons/icon-192.png",
    badge:   data.badge   || "/icons/badge-72.png",
    tag:     data.tag     || "mg-notification",
    data:    { url: data.url || "/uye/bildirimler" },
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ──────────────────────────────────────────────────────
//  Notification Click — bildirimi tıklayınca yönlendir
// ──────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/uye/bildirimler";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ──────────────────────────────────────────────────────
//  Push Subscription Change — token yenilenirse güncelle
// ──────────────────────────────────────────────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.__VAPID_PUBLIC_KEY__,
    }).then((subscription) => {
      return fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
    })
  );
});
