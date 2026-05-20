#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import admin from 'firebase-admin';
import cloudbase from '@cloudbase/node-sdk';
import { createClaimRecord, generateClaimCode, toCsv } from './migration-utils.mjs';

const required = [
  'FIREBASE_SERVICE_ACCOUNT_PATH',
  'TCB_SECRET_ID',
  'TCB_SECRET_KEY',
  'TCB_ENV_ID',
  'CLAIM_CODE_SALT',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const expiresAt = process.env.CLAIM_EXPIRES_AT || daysFromNow(30);
const outputPath = process.env.CLAIM_OUTPUT_CSV || 'migration-claim-codes.csv';
const dryRun = process.argv.includes('--dry-run');

const serviceAccount = JSON.parse(
  await fs.readFile(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const tcb = cloudbase.init({
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
  env: process.env.TCB_ENV_ID,
});
const tcbDb = tcb.database();

const csvRows = [];
let imported = 0;

for await (const user of listFirebaseUsers()) {
  if (!user.email) continue;

  const gameStateDoc = await firestore.collection('game_states').doc(user.uid).get();
  const profileDoc = await firestore.collection('profiles').doc(user.uid).get();
  const claimCode = generateClaimCode();
  const gameStateSnapshot = gameStateDoc.exists ? gameStateDoc.data() : {};
  const profileSnapshot = profileDoc.exists ? profileDoc.data() : {};
  const record = createClaimRecord({
    email: user.email,
    firebaseUid: user.uid,
    gameStateSnapshot: {
      ...gameStateSnapshot,
      migratedProfile: profileSnapshot,
    },
    profileSnapshot,
    claimCode,
    salt: process.env.CLAIM_CODE_SALT,
    expiresAt,
  });

  csvRows.push({
    email: user.email,
    firebaseUid: user.uid,
    claimCode,
    expiresAt,
  });

  if (!dryRun) {
    await tcbDb.collection('migrationClaims').add(record);
  }
  imported += 1;
}

await fs.writeFile(path.resolve(outputPath), toCsv(csvRows), 'utf8');
console.log(`${dryRun ? 'Prepared' : 'Imported'} ${imported} migration claims.`);
console.log(`Claim code CSV: ${path.resolve(outputPath)}`);

async function* listFirebaseUsers(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  for (const user of result.users) yield user;
  if (result.pageToken) {
    yield* listFirebaseUsers(result.pageToken);
  }
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
