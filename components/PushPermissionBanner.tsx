"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, BellOff, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

type PermState = "default" | "granted" | "denied" | "unsupported";

export default function PushPermissionBanner() {
  const [permState, setPermState] = useState<PermState>("default");
  const [dismissed, setDismissed]   = useState(false);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermState("unsupported");
      return;
    }
    setPermState(Notification.permission as PermState);

    // Daha önce kapatıldıysa gösterme
    const key = sessionStorage.getItem("push-banner-dismissed");
    if (key === "1") setDismissed(true);
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermState(perm as PermState);
      if (perm !== "granted") { setLoading(false); return; }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { console.warn("VAPID public key eksik"); setLoading(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subscription: sub }),
      });

      setDismissed(true);
    } catch (err) {
      console.error("[PushBanner] subscribe error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("push-banner-dismissed", "1");
    setDismissed(true);
  };

  // Gösterilmeyecek durumlar
  if (
    dismissed ||
    permState === "granted" ||
    permState === "denied" ||
    permState === "unsupported"
  ) {
    return null;
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 300, width: "calc(100% - 40px)", maxWidth: 440,
      background: "#1A1A1A", border: "1px solid rgba(201,168,76,.3)",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,.6)",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Bell size={18} color="#C9A84C" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
          Bildirimlere İzin Ver
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>
          Su hatırlatmaları, doğum günü ve üyelik bildirimleri alın.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={subscribe}
          disabled={loading}
          style={{
            background: "#C9A84C", color: "#0B0B0B",
            border: "none", borderRadius: 8,
            padding: "7px 13px", fontSize: 12, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : "İzin Ver"}
        </button>
        <button
          onClick={dismiss}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", padding: 4 }}
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Ayrı buton bileşeni — ayarlar sayfasında kullanılabilir
export function PushToggleButton() {
  const [state, setState]   = useState<PermState>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as PermState);
  }, []);

  const toggle = async () => {
    if (state === "denied") {
      alert("Tarayıcı ayarlarından bildirim iznini manuel olarak açmanız gerekiyor.");
      return;
    }
    if (state === "granted") {
      // Aboneliği iptal et
      setLoading(true);
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setState("default");
      } finally {
        setLoading(false);
      }
      return;
    }

    // İzin iste
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setState(perm as PermState);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });
    } finally {
      setLoading(false);
    }
  };

  if (state === "unsupported") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.3)", fontSize: 13 }}>
        <BellOff size={15} />
        Bu tarayıcı bildirimleri desteklemiyor
      </div>
    );
  }

  const isActive = state === "granted";
  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
        background: isActive ? "rgba(201,168,76,.1)" : "rgba(255,255,255,.06)",
        border: `1px solid ${isActive ? "rgba(201,168,76,.3)" : "rgba(255,255,255,.1)"}`,
        borderRadius: 9, color: isActive ? "#C9A84C" : "rgba(255,255,255,.5)",
        fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {isActive ? <Bell size={14} /> : <BellOff size={14} />}
      {loading ? "..." : isActive ? "Bildirimler Açık" : "Bildirimleri Aç"}
    </button>
  );
}
