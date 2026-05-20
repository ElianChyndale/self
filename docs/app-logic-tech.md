# SELF Mini Program Logic and Tech Overview

## Product Purpose

SELF is a WeChat Mini Program for personal productivity, self-management, and lightweight gameified progress tracking. It combines task management, work-session timing, progress stats, and an optional Firebase-to-CloudBase migration flow.

Main user goals:

- create and complete missions/tasks
- track focused work sessions
- read the intelligence/news feed
- view personal growth stats
- maintain a nickname and avatar profile
- optionally import legacy Firebase data

## Main Pages

- `pages/dashboard/index`
  - command overview, rank progress, quick metrics, active missions
- `pages/roster/index`
  - create, edit, complete, and delete missions
- `pages/intel/index`
  - fetch and read intelligence/news items
- `pages/clock/index`
  - run work/rest cycles and energy changes
- `pages/stats/index`
  - profile summary, rank, totals, language switch
- `pages/claim-profile/index`
  - first-run profile setup, later profile editing, and Firebase claim flow

## Launch and Bootstrap Flow

### Startup goals

The app must become interactive quickly and avoid WeChat service timeouts. To achieve that:

- launch does not block on cloud login
- local cache is loaded first
- cloud login runs in the background
- language region refinement runs in the background

### Actual flow

1. `app.ts:onLaunch`
   - initializes CloudBase
   - initializes theme
   - initializes language
   - starts bootstrap asynchronously

2. `app.ts:bootstrap`
   - loads local profile and game state from `wx` storage
   - marks the app bootable immediately
   - enforces first-run profile setup if required
   - attempts cloud login in the background

3. cloud login success
   - merges local and remote profile safely
   - hydrates game state from CloudBase
   - updates capability flags such as `claimMigrationConfigured`
   - refreshes the current page

4. cloud login failure
   - falls back to local-only mode
   - keeps the app usable
   - marks cloud bootstrap as offline for UI messaging

## Data Model

### CloudBase collections

- `users`
  - canonical profile data keyed by `OPENID`
- `gameStates`
  - canonical game progress keyed by `OPENID`
- `migrationClaims`
  - one-time Firebase import claim records

### Local storage

Local storage is cache/fallback only.

Stored keys:

- profile
- game state
- theme preference
- language preference
- intel feed/article caches

## Source of Truth Policy

- CloudBase is the canonical source of truth for profile and game data when available.
- Local `wx` storage is used for fast boot, offline tolerance, and temporary fallback.
- When cloud data arrives after local boot, profile hydration is merge-based rather than all-or-nothing.

Profile merge rules:

- preserve local custom nickname if cloud still has only the generated default nickname
- preserve local avatar if cloud avatar is empty
- preserve cloud linkage fields such as `firebaseUid` and `claimedFirebaseEmail`

## First-Run Profile Gating

### Completion rule

A profile is considered complete only when both are present:

- non-empty nickname
- non-empty avatar URL

### Behavior

- if the current profile is incomplete, the app redirects the user to `pages/claim-profile/index`
- this uses the existing profile page as the onboarding surface
- after successful profile save, the user is returned to the originating tab

This is required because WeChat Mini Programs cannot silently auto-read nickname and avatar on launch without explicit user interaction.

## Profile Edit and Save Flow

### Client

The profile page:

- lets the user choose avatar via WeChat-supported avatar picker
- captures nickname through WeChat-compatible nickname input
- disables profile save until nickname and avatar are both present
- shows inline save status instead of relying only on toasts

### Save behavior

`app.updateProfile(...)` now:

- creates a valid profile even if no profile object exists yet
- updates in-memory global state immediately
- saves to local storage immediately
- refreshes the visible page immediately
- attempts cloud save
- returns whether cloud save succeeded or only local save succeeded

### Cloud behavior

`cloudfunctions/saveProfile`

- upserts profile by `OPENID`
- preserves stable fields such as `createdAt`
- preserves existing migration linkage fields if not overwritten
- returns the saved canonical profile

## Firebase Claim Migration Flow

### Dependencies

Claim migration requires:

- uploaded `claimMigration` cloud function
- `CLAIM_CODE_SALT` configured in CloudBase
- populated `migrationClaims` records

### Claim record format

Current claim records may contain imported Firebase profile data in either:

- `profileSnapshot`
- legacy `gameStateSnapshot.migratedProfile`

The claim flow supports both shapes.

### Client behavior

The profile page keeps the migration section visible, but shows clear state:

- checking backend capability
- unavailable because cloud is offline
- unavailable because migration is not configured
- ready for email + claim code input

Structured claim failures are mapped to user-facing messages:

- invalid code
- already used
- expired
- not configured
- timeout
- unknown failure

### Server behavior

`cloudfunctions/claimMigration`

- validates the claim record
- returns structured success or structured failure
- preserves user-chosen nickname/avatar when imported profile data is sparse
- writes canonical profile and game state back to CloudBase

## Timeout Risk Points and Mitigation

Known timeout risks:

- blocking cloud login on launch
- blocking location/language region detection on launch
- repeated page refresh/navigation loops during bootstrap

Mitigations now in place:

- launch is non-blocking
- cloud bootstrap runs in background
- regional language detection runs in background
- first-run profile navigation is guarded to avoid duplicate redirects

## Current Runtime State

Global runtime state includes:

- profile
- game state
- theme/language preferences
- active theme/language
- cloud capability flags
- cloud bootstrap state (`pending`, `online`, `offline`)

This state is used by pages to decide:

- whether setup is required
- whether claim migration is usable
- whether cloud sync succeeded

## Environment and Operational Dependencies

Required environment/config:

- Mini Program AppID in `project.config.json`
- CloudBase env id in `miniprogram/env.ts`
- uploaded cloud functions:
  - `login`
  - `saveProfile`
  - `saveGameState`
  - `claimMigration`
  - `fetchIntelFeed`
  - `fetchIntelArticle`
- `CLAIM_CODE_SALT` for migration verification
- generated and imported `migrationClaims` records for real Firebase imports

## Known Operational Notes

- If cloud login is slow or unavailable, the app still starts from local cache.
- If profile save cannot reach cloud, the app keeps the local profile and reports local-only save status.
- If migration is not configured, the app does not hide the feature; it shows a graceful unavailable state instead.
