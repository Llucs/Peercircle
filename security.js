// security.js
// Utilitários usando SubtleCrypto:
// - generateKeyPair(): gera par de chaves ECDH (P-256) + chave de assinatura (ECDSA P-256)
// - exportPubKey / importPubKey
// - deriveSharedKey
// - encrypt/decrypt (AES-GCM)

const subtle = window.crypto.subtle;

export async function generateKeyPair() {
  // ECDH for key agreement
  const ecdh = await subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  // ECDSA for signatures (optional but recomendado)
  const signKey = await subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  return { ecdh, signKey };
}

export async function exportPublicKey(key) {
  const raw = await subtle.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

export async function importPublicKey(rawBase64, usage) {
  const raw = base64ToArrayBuffer(rawBase64);
  // usage: "ECDH" or "ECDSA"
  if (usage === "ECDH") {
    return subtle.importKey("raw", raw, { name: "ECDH", namedCurve: "P-256" }, true, []);
  } else {
    return subtle.importKey("raw", raw, { name: "ECDSA", namedCurve: "P-256" }, true, ["verify"]);
  }
}

export async function deriveSharedKey(privateECDH, peerPublicRawBase64) {
  const peerPub = await importPublicKey(peerPublicRawBase64, "ECDH");
  const derived = await subtle.deriveKey(
    { name: "ECDH", namedCurve: "P-256", public: peerPub },
    privateECDH,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return derived;
}

export async function encryptMessage(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv }, aesKey, enc);
  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ct)
  };
}

export async function decryptMessage(aesKey, ivBase64, ciphertextBase64) {
  const iv = base64ToArrayBuffer(ivBase64);
  const ct = base64ToArrayBuffer(ciphertextBase64);
  const pt = await subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, aesKey, ct);
  return new TextDecoder().decode(pt);
}

/* Helpers */
function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}