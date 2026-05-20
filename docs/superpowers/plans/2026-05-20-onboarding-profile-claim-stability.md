# Onboarding, Profile Sync, Claim Flow, and Startup Stability Plan

## Goal

Stabilize first-run onboarding, profile persistence, Firebase claim migration, and startup behavior so the Mini Program remains usable even when cloud services are slow or unavailable.

## Planned Fix Areas

- make first-run profile setup mandatory until nickname and avatar are both complete
- make profile save work even when no profile exists in memory yet
- sync profile changes to local cache immediately and CloudBase when available
- return structured migration status from the backend and surface actionable messages in the UI
- keep launch non-blocking so WeChat runtime timeouts are less likely

## Core Implementation

- add shared profile helpers for completeness checks, merge behavior, and local profile construction
- extend app runtime state with cloud capability and bootstrap status flags
- rework app bootstrap so local cache hydrates first and cloud login reconciles later
- upsert profile data on the server and return the saved canonical profile
- support both legacy and current migration record shapes for imported Firebase profile data
- rework the profile page into a guided setup + maintenance screen with inline statuses

## Validation

- unit tests for profile completeness, profile creation, profile merge, and setup gating
- typecheck and full test suite
- Mini Program build verification
- manual checks for first-run onboarding, later profile edits, claim availability states, and startup stability

## Risks To Watch

- stale generated `.js` files in WeChat DevTools after TypeScript edits
- missing CloudBase function uploads or missing `CLAIM_CODE_SALT`
- old migration records that do not include a dedicated `profileSnapshot`
