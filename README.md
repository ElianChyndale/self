# SELF WeChat Mini Program

Native WeChat Mini Program port of SELF for China internet deployment.

This project intentionally lives beside the existing Firebase web app. It preserves the visual direction and core game rules, but replaces the web/Firebase stack with native Mini Program pages and Tencent CloudBase.

## Stack

- Native WeChat Mini Program WXML/WXSS/TypeScript
- Tencent CloudBase cloud functions and database
- Local `wx` storage for instant boot and offline tolerance
- One-time claim-code migration from Firebase to CloudBase

## Quick Start

1. Replace `wx-placeholder-self-appid` in `project.config.json` with your real Mini Program AppID.
2. Replace `self-cloudbase-env-placeholder` in `miniprogram/env.ts` with your CloudBase environment ID.
3. Run `npm run build:miniprogram` once so the Mini Program runtime `.js` files are emitted next to the `.ts` sources.
4. Open this directory in WeChat Developer Tools. While iterating on TypeScript files, run `npm run watch:miniprogram` in a terminal to keep the emitted `.js` files in sync.
5. Upload these cloud functions: `login`, `saveProfile`, `saveGameState`, `claimMigration`.
6. Upload these cloud functions: `fetchIntelFeed`, `fetchIntelArticle`.
7. Preview on device, then submit for WeChat review when the core flows are stable.

## WeChat Cloud Hosting (Optional)

This project primarily uses CloudBase cloud functions. If you also publish with WeChat Cloud Hosting, the repository must include a `Dockerfile`.

- Docker entrypoint: `cloudhosting/server.mjs`
- Health endpoint: `/healthz`

If Cloud Hosting reports `没有找到Dockerfile`, verify the selected code repository path points to this project root where `Dockerfile` exists.

## Local Checks

```powershell
npm test --prefix SELFWeChatMiniProgram
npm run typecheck --prefix SELFWeChatMiniProgram
```

## V1 Scope

- Command center
- Mission roster
- Intelligence feed with in-app reader and article XP
- Work clock
- Chapter stats
- Profile nickname/avatar
- Firebase data claim flow
