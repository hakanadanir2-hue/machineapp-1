// Supabase Edge Function — send-notifications
// Deno runtime
// Görevler: water / renewal / birthday / trainer_comment bildirimleri
// web-push VAPID kullanır (FCM gerektirmez)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── VAPID ile Web Push imzası ──────────────────────────────────────────────────
// Deno'da 'web-push' npm paketi yerine manuel VAPID JWT oluşturuyoruz.

async function importPrivateKey(pemOrJwk: string): Promise<CryptoKey> {
  // Base64url encoded raw private key (VAPID private key)
  const raw = base64UrlDecode(pemOrJwk);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function createVapidJwt(endpoint: string, vapidSubject: string, privateKeyB64: string): Promise<string> {
  const audience = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 3600;

  const header  = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp, sub: vapidSubject };

  const enc = new TextEncoder();
  const headerEnc   = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadEnc  = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerEnc}.${payloadEnc}`;

  const key = await importPrivateKey(privateKeyB64);
  const sig  = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(signingInput)
  );
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

// ── Push Gönder ───────────────────────────────────────────────────────────────
async function sendWebPush(params: {
  endpoint: string;
  p256dh: string;
  auth: string;
  payload: object;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
}): Promise<{ ok: boolean; status?: number; error?: string }> {
  const { endpoint, p256dh, auth, payload, vapidPublicKey, vapidPrivateKey, vapidSubject } = params;

  const jwt = await createVapidJwt(endpoint, vapidSubject, vapidPrivateKey);

  // ECDH anahtar anlaşması + AES-GCM şifreleme
  const encrypted = await encryptPayload(JSON.stringify(payload), p256dh, auth);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type":   "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Authorization":  `vapid t=${jwt},k=${vapidPublicKey}`,
      "TTL":            "86400",
      "Content-Length": String(encrypted.byteLength),
    },
    body: encrypted,
  });

  if (res.ok || res.status === 201) return { ok: true };
  const text = await res.text().catch(() => "");
  return { ok: false, status: res.status, error: text };
}

// AES-128-GCM şifreleme (RFC 8291)
async function encryptPayload(plaintext: string, p256dhB64: string, authB64: string): Promise<ArrayBuffer> {
  const enc      = new TextEncoder();
  const authInfo = enc.encode("Content-Encoding: auth\0");

  const p256dhKey = base64UrlDecode(p256dhB64);
  const authBytes = base64UrlDecode(authB64);

  // Ephemeral ECDH keypair
  const ephemeralPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const receiverKey = await crypto.subtle.importKey(
    "raw", p256dhKey,
    { name: "ECDH", namedCurve: "P-256" },
    false, []
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverKey },
    ephemeralPair.privateKey,
    256
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // PRK (HKDF extract)
  const prk = await crypto.subtle.importKey("raw", sharedBits, { name: "HKDF" }, false, ["deriveBits"]);

  // HKDF expand for CEK and nonce
  const exportedEphemeral = await crypto.subtle.exportKey("raw", ephemeralPair.publicKey);
  const keyInfo   = concat(enc.encode("Content-Encoding: aesgcm\0"), authInfo, p256dhKey, new Uint8Array(exportedEphemeral));
  const nonceInfo = concat(enc.encode("Content-Encoding: nonce\0"),  authInfo, p256dhKey, new Uint8Array(exportedEphemeral));

  const [cekBits, nonceBits] = await Promise.all([
    crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: authBytes, info: keyInfo   }, prk, 128),
    crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: authBytes, info: nonceInfo }, prk, 96),
  ]);

  const aesKey = await crypto.subtle.importKey("raw", cekBits, "AES-GCM", false, ["encrypt"]);

  const data = enc.encode(plaintext);
  const padded = new Uint8Array(data.length + 2);
  padded.set([0, 0]); // 2-byte pad length = 0
  padded.set(data, 2);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonceBits },
    aesKey,
    padded
  );

  // aes128gcm record (RFC 8291 §4)
  const rawEph = new Uint8Array(exportedEphemeral);
  const result = new Uint8Array(
    16 + 4 + 1 + rawEph.length + ciphertext.byteLength
  );
  let offset = 0;
  result.set(salt, offset); offset += 16;
  const dv = new DataView(result.buffer);
  dv.setUint32(offset, 4096, false); offset += 4; // rs = 4096
  result[offset++] = rawEph.length; // keyid len
  result.set(rawEph, offset); offset += rawEph.length;
  result.set(new Uint8Array(ciphertext), offset);

  return result.buffer;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out   = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

// ── Supabase init ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUB     = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIV    = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@machinegym.com";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Yardımcı: üyeye bildirim + push gönder ───────────────────────────────────
async function notifyMember(params: {
  memberId: string;
  type:    "water" | "renewal" | "birthday" | "trainer_comment";
  title:   string;
  body:    string;
  url?:    string;
}) {
  const { memberId, type, title, body, url } = params;

  // 1. member_notifications tablosuna yaz
  await supabase.from("member_notifications").insert({
    member_id: memberId,
    type,
    title,
    body,
    read: false,
  });

  // 2. Push subscription'larını çek
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("member_id", memberId);

  if (!subs || subs.length === 0) return;

  const pushPayload = { title, body, url: url ?? "/uye/bildirimler" };

  for (const sub of subs) {
    const res = await sendWebPush({
      endpoint:      sub.endpoint,
      p256dh:        sub.p256dh,
      auth:          sub.auth,
      payload:       pushPayload,
      vapidPublicKey:  VAPID_PUB,
      vapidPrivateKey: VAPID_PRIV,
      vapidSubject:    VAPID_SUBJECT,
    });

    // 410 Gone veya 404 → geçersiz subscription, sil
    if (!res.ok && (res.status === 410 || res.status === 404)) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
  }
}

// ── Bildirim görevleri ────────────────────────────────────────────────────────

async function sendWaterReminders() {
  // Tüm aktif üyeler
  const { data: members } = await supabase
    .from("members")
    .select("id")
    .eq("is_active", true);

  for (const m of members ?? []) {
    await notifyMember({
      memberId: m.id,
      type:    "water",
      title:   "Su İçme Zamanı!",
      body:    "Günlük su hedefine ulaşmak için biraz daha iç. Hedef: 8 bardak.",
      url:     "/uye/su",
    });
  }
  return { sent: members?.length ?? 0 };
}

async function sendRenewalReminders() {
  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() + 7);
  const today = new Date().toISOString().split("T")[0];
  const target = sevenDays.toISOString().split("T")[0];

  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, membership_end")
    .gte("membership_end", today)
    .lte("membership_end", target)
    .eq("is_active", true);

  for (const m of members ?? []) {
    const end     = new Date(m.membership_end);
    const daysLeft = Math.ceil((end.getTime() - Date.now()) / 86400000);
    await notifyMember({
      memberId: m.id,
      type:    "renewal",
      title:   "Üyeliğin Sona Eriyor",
      body:    `Üyeliğin ${daysLeft} gün içinde sona erecek. Yenilemek için hemen başvur!`,
      url:     "/uye",
    });
  }
  return { sent: members?.length ?? 0 };
}

async function sendBirthdayNotifications() {
  const today = new Date();
  const mm    = String(today.getMonth() + 1).padStart(2, "0");
  const dd    = String(today.getDate()).padStart(2, "0");

  // birthday_date sütunundan ay-gün eşleşmesi
  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, birth_date")
    .filter("birth_date", "like", `%-${mm}-${dd}`)
    .eq("is_active", true);

  for (const m of members ?? []) {
    await notifyMember({
      memberId: m.id,
      type:    "birthday",
      title:   "Mutlu Yıllar!",
      body:    `Doğum günün kutlu olsun, ${m.full_name ?? "değerli üyemiz"}! Machine Gym ailesi seninle.`,
      url:     "/uye",
    });
  }
  return { sent: members?.length ?? 0 };
}

// ── HTTP Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  // Yetkilendirme: servis rolü veya Authorization header
  const authHeader = req.headers.get("Authorization");
  const expectedToken = Deno.env.get("EDGE_FUNCTION_SECRET");
  if (expectedToken && authHeader !== `Bearer ${expectedToken}` && authHeader !== `Bearer ${SERVICE_ROLE}`) {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401 });
  }

  let body: { task?: string; member_id?: string; title?: string; message?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const task = body.task;

  try {
    switch (task) {
      case "water":
        return Response.json({ ok: true, task, ...(await sendWaterReminders()) });

      case "renewal":
        return Response.json({ ok: true, task, ...(await sendRenewalReminders()) });

      case "birthday":
        return Response.json({ ok: true, task, ...(await sendBirthdayNotifications()) });

      case "manual": {
        // Admin tarafından tetiklenen manuel bildirim
        const { member_id, title, message } = body;
        if (!member_id || !title) {
          return Response.json({ error: "member_id ve title zorunlu" }, { status: 400 });
        }
        await notifyMember({
          memberId: member_id,
          type:    "info" as unknown as "trainer_comment",
          title,
          body:    message ?? "",
        });
        return Response.json({ ok: true, task: "manual" });
      }

      default:
        return Response.json({ error: "Geçersiz task. Beklenen: water | renewal | birthday | manual" }, { status: 400 });
    }
  } catch (err) {
    console.error("[send-notifications]", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
