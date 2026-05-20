# Covert Inquisitorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mini program's visual system into a cleaner, simpler covert-inquisitorial UI across shared chrome, tab bar, and all pages while preserving existing interactions and theme switching.

**Architecture:** The redesign centers on the shared design system in `miniprogram/app.wxss`, then layers page-specific refinements on top through each page's `index.wxml` and `index.wxss`. Logic stays mostly unchanged, with a small theme utility test pass to lock the updated chrome behavior before the shared styles and markup are refreshed.

**Tech Stack:** WeChat Mini Program (`wxml`, `wxss`, `ts`), TypeScript, Vitest

---

## File Map

- Modify: `tests/theme.test.ts`
  - Extend the existing theme utility coverage to lock the navigation chrome palette used by the redesign.
- Modify: `miniprogram/utils/theme.ts`
  - Update the navigation bar colors so app-level chrome matches the new dark/light design system.
- Modify: `miniprogram/app.wxss`
  - Replace the current ornate Warhammer styling with the new shared covert-inquisitorial tokens and component primitives.
- Modify: `miniprogram/custom-tab-bar/index.wxml`
  - Simplify tab markup so the active state can be driven by a subtle indicator line and quieter labels.
- Modify: `miniprogram/custom-tab-bar/index.wxss`
  - Restyle the tab bar to match the new command-interface shell.
- Modify: `miniprogram/pages/dashboard/index.wxml`
  - Simplify the dashboard masthead and metrics structure.
- Modify: `miniprogram/pages/dashboard/index.wxss`
  - Add dashboard-specific layout refinements for summary cards, mission list, and theme chooser.
- Modify: `miniprogram/pages/intel/index.wxml`
  - Tighten the intel toolbar, tabs, cards, and reader overlay structure.
- Modify: `miniprogram/pages/intel/index.wxss`
  - Restyle the intel feed and reader states with the new restrained accent system.
- Modify: `miniprogram/pages/roster/index.wxml`
  - Simplify mission composer, filter bar, and mission card layout.
- Modify: `miniprogram/pages/roster/index.wxss`
  - Align roster spacing, action grouping, and card emphasis to the shared system.
- Modify: `miniprogram/pages/clock/index.wxml`
  - Promote the timer to the focal element and simplify surrounding support panels.
- Modify: `miniprogram/pages/clock/index.wxss`
  - Restyle the timer surface, action row, and support metrics.
- Modify: `miniprogram/pages/stats/index.wxml`
  - Simplify the profile, rank, and summary metric layout.
- Modify: `miniprogram/pages/stats/index.wxss`
  - Apply cleaner profile framing and data-panel treatment.
- Modify: `miniprogram/pages/claim-profile/index.wxml`
  - Restructure the profile and migration flow for clarity-first presentation.
- Modify: `miniprogram/pages/claim-profile/index.wxss`
  - Align avatar, form spacing, and trust-oriented card styling with the new system.

### Task 1: Lock Theme Chrome Behavior

**Files:**
- Modify: `tests/theme.test.ts`
- Modify: `miniprogram/utils/theme.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { applyThemeChrome } from '../miniprogram/utils/theme';

describe('theme chrome application', () => {
  it('uses the redesign navigation colors for dark and light themes', () => {
    const setNavigationBarColor = vi.fn();
    vi.stubGlobal('wx', { setNavigationBarColor });

    applyThemeChrome('dark');
    applyThemeChrome('light');

    expect(setNavigationBarColor).toHaveBeenNthCalledWith(1, {
      frontColor: '#ffffff',
      backgroundColor: '#050607',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });

    expect(setNavigationBarColor).toHaveBeenNthCalledWith(2, {
      frontColor: '#000000',
      backgroundColor: '#e7e1d2',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });

    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/theme.test.ts`
Expected: FAIL because `applyThemeChrome` still returns the old navigation colors.

- [ ] **Step 3: Write minimal implementation**

```ts
export function applyThemeChrome(activeTheme: ActiveTheme): void {
  if (typeof wx.setNavigationBarColor !== 'function') return;

  if (activeTheme === 'dark') {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#050607',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });
    return;
  }

  wx.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: '#e7e1d2',
    animation: { duration: 200, timingFunc: 'easeIn' },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/theme.test.ts`
Expected: PASS

- [ ] **Step 5: Checkpoint**

Run: `npm run typecheck`
Expected: PASS

### Task 2: Rebuild The Shared Shell And Tab Bar

**Files:**
- Modify: `miniprogram/app.wxss`
- Modify: `miniprogram/custom-tab-bar/index.wxml`
- Modify: `miniprogram/custom-tab-bar/index.wxss`

- [ ] **Step 1: Add the shared design tokens and component primitives**

Update `miniprogram/app.wxss` to:
- Replace the warm parchment/brass palette with near-black, graphite, bone, muted gold, and restrained crimson tokens.
- Remove shrine framing, rivets, and heavy metallic gradients from `.masthead-*`, `.card`, `.button`, `.input`, `.progress`, and related shared classes.
- Introduce cleaner component primitives for simple rectangular cards, subtle accent strips, flatter progress bars, and calmer page backgrounds.

- [ ] **Step 2: Update the masthead and global component styling**

Ensure the shared styles support:
- flatter mastheads with a simple title block and compact control area
- quieter labels and subtitles
- emphasis states that use accents sparingly rather than full-surface ornament

- [ ] **Step 3: Simplify the tab bar markup**

Update `miniprogram/custom-tab-bar/index.wxml` so each tab item can render a small indicator line and quieter sigil/label grouping:

```xml
<view class="tab-item {{selected === index ? 'tab-item-active' : ''}}" ...>
  <view class="tab-item-indicator"></view>
  <view class="tab-item-sigil">{{item.sigil}}</view>
  <text class="tab-item-label">{{item.text}}</text>
</view>
```

- [ ] **Step 4: Restyle the tab bar**

Update `miniprogram/custom-tab-bar/index.wxss` to:
- reduce decorative panel treatment
- use flatter backgrounds and thinner borders
- show active state through contrast and a thin indicator line
- keep inactive tabs visually quiet

- [ ] **Step 5: Build the Mini Program output**

Run: `npm run build:miniprogram`
Expected: PASS

### Task 3: Redesign Dashboard, Intel, And Roster

**Files:**
- Modify: `miniprogram/pages/dashboard/index.wxml`
- Modify: `miniprogram/pages/dashboard/index.wxss`
- Modify: `miniprogram/pages/intel/index.wxml`
- Modify: `miniprogram/pages/intel/index.wxss`
- Modify: `miniprogram/pages/roster/index.wxml`
- Modify: `miniprogram/pages/roster/index.wxss`

- [ ] **Step 1: Simplify dashboard structure**

Update dashboard markup to:
- remove rivet elements from the masthead
- promote rank/system summary as the focal block
- convert summary metrics into quieter data panels
- simplify the mission list and theme chooser structure

- [ ] **Step 2: Apply dashboard-specific styling**

Update dashboard styles to:
- support the new compact masthead control
- tighten metric panel rhythm
- make the pending mission list read as a command queue rather than a decorative list

- [ ] **Step 3: Tighten intel markup and reader structure**

Update intel markup to:
- simplify the masthead
- tighten the refresh/status card
- keep category tabs scannable
- make the reader overlay feel like a controlled archive drawer

- [ ] **Step 4: Apply intel styling**

Update intel styles to:
- reduce card ornament
- use crimson only for degraded or alert-like states
- keep article metadata and read state crisp and restrained

- [ ] **Step 5: Simplify roster composer and mission cards**

Update roster markup and styles to:
- make the composer read as a plain command form
- keep difficulty/filter groups compact and clearly segmented
- simplify mission cards and action stacks for better scanability

- [ ] **Step 6: Build and type-check**

Run: `npm run build:miniprogram`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

### Task 4: Redesign Clock, Stats, And Claim Profile

**Files:**
- Modify: `miniprogram/pages/clock/index.wxml`
- Modify: `miniprogram/pages/clock/index.wxss`
- Modify: `miniprogram/pages/stats/index.wxml`
- Modify: `miniprogram/pages/stats/index.wxss`
- Modify: `miniprogram/pages/claim-profile/index.wxml`
- Modify: `miniprogram/pages/claim-profile/index.wxss`

- [ ] **Step 1: Rework clock layout**

Update clock markup and styles to:
- remove rivet framing from the masthead
- make the timer the strongest visual anchor
- simplify support cards and action layout
- preserve existing work/rest state controls

- [ ] **Step 2: Rework stats layout**

Update stats markup and styles to:
- simplify the profile card
- present rank progress as a clear system panel
- convert summary values into disciplined data tiles

- [ ] **Step 3: Rework claim profile flow**

Update claim profile markup and styles to:
- simplify the masthead
- improve avatar/profile form spacing
- make the migration form look trustworthy and calm rather than dramatic

- [ ] **Step 4: Full verification**

Run: `npm test`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build:miniprogram`
Expected: PASS
