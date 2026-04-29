#!/usr/bin/env node
/**
 * VAPID anahtar çifti oluştur
 * Kullanım: node scripts/generate-vapid-keys.mjs
 */
import { webcrypto } from "crypto";

const { subtle } = webcrypto;

function toBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const keypair = await subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"]
);

const publicKeyRaw  = await subtle.exportKey("raw", keypair.publicKey);
const privateKeyRaw = await subtle.exportKey("pkcs8", keypair.privateKey);

// PKCS#8'den raw private key (son 32 byte)
const pkcs8 = new Uint8Array(privateKeyRaw);
const privRaw = pkcs8.slice(pkcs8.length - 32);

console.log("\n=== VAPID Keys ===\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + toBase64Url(publicKeyRaw));
console.log("VAPID_PRIVATE_KEY=" + toBase64Url(privRaw.buffer));
console.log("\nBu değerleri .env.local ve Supabase Edge Function secret'larına ekleyin.\n");
