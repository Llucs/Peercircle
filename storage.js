// storage.js
// Simples wrapper IndexedDB para mensagens + segredos (armazenar chaves em formato não-plain)

const DB_NAME = "peercircle-db";
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("messages")) db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("secrets")) db.createObjectStore("secrets", { keyPath: "name" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function saveMessage(obj) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("messages", "readwrite");
    tx.objectStore("messages").add(obj);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

export async function getAllMessages() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("messages", "readonly");
    const req = tx.objectStore("messages").getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function saveSecret(name, value) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("secrets", "readwrite");
    tx.objectStore("secrets").put({ name, value });
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

export async function getSecret(name) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("secrets", "readonly");
    const req = tx.objectStore("secrets").get(name);
    req.onsuccess = () => res(req.result ? req.result.value : null);
    req.onerror = () => rej(req.error);
  });
}

export async function clearAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(["messages","secrets"], "readwrite");
    tx.objectStore("messages").clear();
    tx.objectStore("secrets").clear();
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}