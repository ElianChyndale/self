import crypto from 'node:crypto';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function generateClaimCode(bytes = 5) {
  return crypto.randomBytes(bytes).toString('hex').toUpperCase();
}

export function hashClaimCode(claimCode, salt) {
  return crypto
    .createHash('sha256')
    .update(`${String(claimCode).trim().toUpperCase()}:${salt}`)
    .digest('hex');
}

export function createClaimRecord({ email, firebaseUid, gameStateSnapshot, claimCode, salt, expiresAt }) {
  return {
    emailLower: normalizeEmail(email),
    firebaseUid,
    claimCodeHash: hashClaimCode(claimCode, salt),
    gameStateSnapshot,
    expiresAt,
    claimedByOpenId: null,
    claimedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function toCsv(rows) {
  const header = ['email', 'firebaseUid', 'claimCode', 'expiresAt'];
  const lines = rows.map((row) => header.map((key) => csvCell(row[key])).join(','));
  return [header.join(','), ...lines].join('\n');
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
