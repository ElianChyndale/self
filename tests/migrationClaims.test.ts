import { describe, expect, it } from 'vitest';
import { createClaimRecord, hashClaimCode, normalizeEmail, toCsv } from '../scripts/migration-utils.mjs';

describe('migration claim helpers', () => {
  it('normalizes email and hashes a one-time claim code', () => {
    const hash = hashClaimCode('ABCD12', 'salt');
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashClaimCode('abcd12', 'salt'));
    expect(normalizeEmail(' Elian@SELF.com ')).toBe('elian@self.com');
  });

  it('creates claim records without storing the raw claim code', () => {
    const record = createClaimRecord({
      email: 'elian@self.com',
      firebaseUid: 'uid-1',
      gameStateSnapshot: { totalXp: 675 },
      claimCode: 'ABCD12',
      salt: 'salt',
      expiresAt: '2026-06-20T00:00:00.000Z',
    });

    expect(record.emailLower).toBe('elian@self.com');
    expect(record.claimCodeHash).not.toBe('ABCD12');
    expect(record.claimedAt).toBeNull();
  });

  it('exports owner-readable claim CSV rows', () => {
    expect(toCsv([{ email: 'elian@self.com', firebaseUid: 'uid-1', claimCode: 'ABCD12', expiresAt: 'x' }]))
      .toContain('"elian@self.com","uid-1","ABCD12","x"');
  });
});
