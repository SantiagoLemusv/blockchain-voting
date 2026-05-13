/**
 * receiptStorage.js — Almacenamiento local de comprobantes de voto.
 *
 * TRADE-OFF DE PRIVACIDAD:
 * Los comprobantes se guardan SOLO en localStorage del navegador del votante.
 * Nadie más puede acceder. Esto permite al votante consultar sus propios
 * comprobantes sin exponer información on-chain a terceros.
 *
 * No guardamos qué candidato/opción votó — solo hash, bloque, dirección de
 * la elección y nombre. La verificación se hace contra blockchain.
 */

const STORAGE_KEY_PREFIX = "voting-receipts-";

function keyFor(account) {
  return `${STORAGE_KEY_PREFIX}${account?.toLowerCase() || "guest"}`;
}

export function saveReceipt(account, receipt) {
  if (!account) return;
  try {
    const key = keyFor(account);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [
      {
        ...receipt,
        savedAt: new Date().toISOString(),
      },
      ...existing,
    ].slice(0, 50); // máximo 50 comprobantes
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("No se pudo guardar comprobante:", err);
  }
}

export function getReceipts(account) {
  if (!account) return [];
  try {
    const key = keyFor(account);
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (err) {
    return [];
  }
}

export function clearReceipts(account) {
  if (!account) return;
  try {
    localStorage.removeItem(keyFor(account));
  } catch (err) {
    console.warn("No se pudo borrar comprobantes:", err);
  }
}

/**
 * Genera un código corto legible de verificación a partir del hash de
 * transacción. Formato: AB12-CD34-EF56 (12 caracteres del hash, agrupados).
 */
export function generateShortCode(txHash) {
  if (!txHash) return "";
  const clean = txHash.replace(/^0x/, "").toUpperCase();
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
}
