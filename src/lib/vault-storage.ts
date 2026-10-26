import { get, update } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';
const KEY_ID = 'unbill-device-key-v2';
let keyPromise: Promise<CryptoKey> | undefined;
function deviceKey() {
  if (!keyPromise)
    keyPromise = (async () => {
      let key = await get<CryptoKey>(KEY_ID);
      if (!key) {
        key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
          'encrypt',
          'decrypt',
        ]);
        const candidate = key;
        await update<CryptoKey>(KEY_ID, (existing) => {
          key = existing || candidate;
          return key;
        });
      }
      return key;
    })().catch((error) => {
      keyPromise = undefined;
      throw error;
    });
  return keyPromise;
}
const encode = (data: Uint8Array) => btoa(Array.from(data, (b) => String.fromCharCode(b)).join(''));
const decode = (data: string) => Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
export async function encryptVault(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await deviceKey(),
    new TextEncoder().encode(plain),
  );
  return JSON.stringify({
    version: 2,
    iv: encode(iv),
    ciphertext: encode(new Uint8Array(ciphertext)),
  });
}
export async function decryptVault(raw: string): Promise<string> {
  const record = JSON.parse(raw);
  if (
    record.version !== 2 ||
    typeof record.iv !== 'string' ||
    typeof record.ciphertext !== 'string'
  )
    throw new Error('Unrecognized vault format');
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decode(record.iv) },
    await deviceKey(),
    decode(record.ciphertext),
  );
  return new TextDecoder().decode(plain);
}
let pending = Promise.resolve();
let readFailed = false;
export const encryptedStateStorage: StateStorage = {
  async getItem(name) {
    await pending;
    const raw = localStorage.getItem(name);
    if (raw) {
      try {
        return await decryptVault(raw);
      } catch (error) {
        readFailed = true;
        throw error;
      }
    }
    const legacy = localStorage.getItem('unbill_vault_v1');
    if (!legacy) return null;
    let state;
    try {
      state = JSON.parse(new TextDecoder().decode(decode(legacy)));
    } catch {
      state = JSON.parse(legacy);
    }
    // Zustand's merge validates and rebuilds legacy reports before the next encrypted write.
    return JSON.stringify(state);
  },
  setItem(name, value) {
    if (readFailed) {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('unbill-vault-error'));
      return Promise.resolve();
    }
    pending = pending
      .catch(() => {})
      .then(async () => {
        const legacy = localStorage.getItem('unbill_vault_v1');
        if (legacy && !localStorage.getItem('unbill_vault_legacy_archive_v2'))
          localStorage.setItem('unbill_vault_legacy_archive_v2', await encryptVault(legacy));
        localStorage.setItem(name, await encryptVault(value));
        localStorage.removeItem('unbill_vault_v1');
      });
    return pending.catch(() => {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('unbill-vault-error'));
    });
  },
  async removeItem(name) {
    await pending;
    localStorage.removeItem(name);
    localStorage.removeItem('unbill_vault_v1');
  },
};

export async function legacyArchive() {
  await pending;
  const raw = localStorage.getItem('unbill_vault_legacy_archive_v2');
  return raw ? decryptVault(raw) : null;
}
export async function clearLegacyArchive() {
  await pending;
  localStorage.removeItem('unbill_vault_legacy_archive_v2');
  localStorage.removeItem('unbill_vault_v1');
}
