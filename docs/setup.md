# SELF WeChat Mini Program Setup

## 1. Accounts and IDs

Create or open a WeChat Mini Program account in the WeChat public platform.

Replace placeholders:

- `project.config.json`: set `appid` to the Mini Program AppID.
- `miniprogram/env.ts`: set `CLOUD_ENV_ID` to the Tencent CloudBase environment ID.
- Cloud function `claimMigration`: configure environment variable `CLAIM_CODE_SALT`.

Use the same `CLAIM_CODE_SALT` for migration generation and CloudBase verification.

## 2. CloudBase Collections

Create these collections in CloudBase:

- `users`
- `gameStates`
- `migrationClaims`

Recommended permissions:

- Keep client direct database access closed for `users` and `gameStates`.
- Mutate through cloud functions only.
- Keep `migrationClaims` server-only.

## 3. Cloud Functions

Upload these directories from WeChat Developer Tools:

- `cloudfunctions/login`
- `cloudfunctions/saveProfile`
- `cloudfunctions/saveGameState`
- `cloudfunctions/claimMigration`

The Mini Program calls these by function name.

## 4. Firebase Migration Claims

Install dependencies inside `SELFWeChatMiniProgram/` if needed:

```powershell
npm install
```

Set environment variables:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="D:\secure\firebase-service-account.json"
$env:TCB_SECRET_ID="your-tencent-secret-id"
$env:TCB_SECRET_KEY="your-tencent-secret-key"
$env:TCB_ENV_ID="your-cloudbase-env-id"
$env:CLAIM_CODE_SALT="long-random-secret"
$env:CLAIM_OUTPUT_CSV="D:\secure\self-claim-codes.csv"
npm run migration:claims --prefix SELFWeChatMiniProgram
```

The script reads Firebase Auth users, Firestore `profiles`, and Firestore `game_states`, then writes hashed one-time claim records to CloudBase. The CSV contains raw claim codes for you to distribute privately.

Dry run:

```powershell
npm run migration:claims --prefix SELFWeChatMiniProgram -- --dry-run
```

## 5. WeChat Developer Tools

Open `SELFWeChatMiniProgram/` as the project directory.

Recommended settings:

- Do not enable automatic ES6 to ES5 conversion.
- Do not enable upload-time style auto-completion.
- Do not enable upload-time code compression during early testing.

Run through:

- First launch creates or loads a CloudBase user.
- Profile page can save nickname/avatar.
- Claim page imports Firebase data with email + claim code.
- Work clock behaves as 25m work, 5m rest, -10 energy after rest.
- Long recovery restores energy to 100.

## 6. Release

Before review:

- Confirm no Firebase URLs are used by the Mini Program client.
- Confirm CloudBase functions are uploaded to the production environment.
- Confirm account category and privacy text match the app behavior.
- Preview on a real WeChat device.
