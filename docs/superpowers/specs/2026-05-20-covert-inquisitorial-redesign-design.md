# Covert Inquisitorial Redesign

## Goal

Redesign the SELF WeChat Mini Program so it keeps a clear Warhammer 40K influence while becoming simpler, cleaner, and more usable. The new direction should feel austere and disciplined rather than ornate. The redesign applies across the full mini program, including shared page chrome and the custom tab bar, while keeping both light and dark themes polished.

## Chosen Direction

The redesign will use a covert inquisitorial system style.

Characteristics:
- Dark-first emotional tone, with light theme as an equally polished secondary mode
- Mostly plain matte surfaces with thin borders and restrained contrast
- Identity carried by typography, muted gold hierarchy, and subtle crimson status accents
- Sparse ceremonial detail instead of loud iconography or decorative frames
- Warhammer influence expressed through tone and interface discipline more than overt ornament

This direction intentionally avoids:
- Heavy parchment fantasy styling
- Visible rivets and reliquary-like framing as default chrome
- Constant high-contrast metallic gradients
- Overuse of sigils, seals, or decorative trim

## Design Principles

1. The UI should feel severe, intentional, and premium.
2. Surfaces should stay simple; status and hierarchy should do the visual work.
3. The app should remain readable as a productivity tool even for users who do not care about Warhammer references.
4. The shared system should unify all screens so the app feels designed as one product rather than a set of themed pages.
5. Dark and light themes should feel like the same system, not two unrelated skins.

## Visual System

### Color

Dark theme:
- Base background: near-black and charcoal
- Secondary surfaces: dark iron and graphite
- Primary text: pale bone
- Secondary text: muted ash and warm gray
- Authority accent: subdued gold
- Alert/live accent: restrained crimson

Light theme:
- Base background: desaturated bone and cold parchment
- Secondary surfaces: pale steel and muted ivory
- Primary text: deep charcoal
- Secondary text: warm gray-brown
- Authority accent: darker brass-gold
- Alert/live accent: muted oxide crimson

Accent behavior:
- Gold marks hierarchy, selected state, progress emphasis, and important action framing
- Crimson marks alert states, degraded relay states, danger actions, and live signal cues
- Accents should appear in small, meaningful moments rather than washing large surfaces

### Typography

- Display typography remains formal and severe for page titles, major values, and tab identities
- Body typography remains compact and readable
- Titles use wider tracking and uppercase treatment where appropriate
- Supporting copy stays understated and avoids decorative treatment

### Ornament

- Minimal linework, section dividers, inset borders, and controlled edge accents
- Abstract rather than literal iconography
- Small sacred or institutional details may appear in highlighted states, but not as default framing on every component

## Shared Shell

### Page Masthead

The masthead becomes flatter and calmer.

Changes:
- Remove visible rivets and heavy shrine-style framing
- Keep one clear title block, one small kicker or status line, and one compact control area
- Reduce vertical bulk
- Use accent color mainly in the title, status marker, or active control state

Expected result:
- Cleaner first impression
- More consistent hierarchy across all pages
- Less visual noise before the page content begins

### Screen Background

- Backgrounds use subtle tonal layering rather than visible decorative gradients
- Dark mode should feel deep and controlled, not glossy
- Light mode should feel disciplined and desaturated, not cozy or antique

### Cards

Cards become simpler console panels.

Rules:
- Rectangular, clean, thin borders
- Low-contrast fills
- Reduced glow and metallic treatment
- Optional single accent edge, title tone, or state strip for emphasis

Variants:
- Standard card for content and forms
- Emphasis card for key progress or rank information
- Status card for degraded, warning, or alert states

### Buttons

- Primary buttons use crisp contrast and restrained gold emphasis
- Secondary buttons use quieter fills and lighter borders
- Danger buttons use crimson accents without oversized visual aggression
- Button typography remains formal but not theatrical

### Inputs

- Inputs feel like sealed console fields
- Flat surfaces, modest inset treatment, disciplined borders
- Placeholder text stays legible but quiet

### Progress And Metrics

- Progress bars become flatter and more technical
- Gold indicates achievement or rank progression
- Crimson and other state cues appear only when semantically necessary
- Large numeric metrics remain important but lose the heavily ornamental framing

## Navigation

### Custom Tab Bar

The tab bar should become simpler and more premium.

Changes:
- Reduce decorative panel feel
- Keep small abstract sigils or icon markers only if they remain subtle
- Active tab indicated by text contrast plus a thin gold or crimson line
- More visual quiet in inactive states
- Better alignment with shared page chrome

Expected result:
- Stronger app-wide identity
- Less weight at the bottom of the screen
- Faster scanning across tabs

## Per-Page Application

### Dashboard

Purpose:
- Present command overview, rank progression, energy, and current work

Changes:
- Make rank and system status the visual anchor
- Use simpler metric blocks
- Keep mission overview concise
- Reduce decorative framing around the top section

### Intel

Purpose:
- Present feed status, categories, articles, and reader flow

Changes:
- Treat intel as the cleanest expression of the system
- Use crimson sparingly for degraded relay or live signal states
- Keep article cards sharp and structured
- Make the reader panel feel like a controlled archive overlay, not a fantasy modal

### Roster

Purpose:
- Create, filter, and complete missions

Changes:
- Emphasize task clarity first
- Make form controls and difficulty states cleaner and easier to scan
- Keep completion, edit, and delete actions distinct without visual clutter

### Clock

Purpose:
- Track focused work and time state

Changes:
- Build around one central timing element with strong hierarchy
- Use status accents for active, paused, and ended states
- Maintain visual restraint so the timer feels precise

### Stats

Purpose:
- Show performance history and progression

Changes:
- Present summaries as disciplined data panels
- Use gold only to elevate notable metrics or milestones
- Keep comparative information easy to scan

### Claim Profile

Purpose:
- Support migration or profile claim flow

Changes:
- Make trust and clarity primary
- Use status and warning treatment carefully
- Avoid dramatic theming that could reduce confidence in the flow

## Theme Strategy

Both themes remain first-class.

Dark theme:
- Main identity mode
- Strongest emotional expression of the covert inquisitorial direction

Light theme:
- Same structure and spacing
- Reduced warmth compared with current parchment styling
- More steel-and-bone than scroll-and-brass

Shared expectation:
- Users should recognize the same product immediately in both modes

## Implementation Scope

In scope:
- Shared global theme variables in app-level styles
- Masthead and shared shell updates
- Custom tab bar redesign
- Component refinements for cards, buttons, inputs, progress bars, labels, and metrics
- Visual updates across dashboard, intel, roster, clock, stats, and claim profile pages

Out of scope:
- New product features
- Changes to business logic, data storage, or cloud functions unless needed for UI wiring
- Full information architecture rewrite

## Testing Expectations

Visual verification:
- Confirm both light and dark themes render correctly
- Confirm page spacing, typography, and tab states stay coherent across all pages
- Confirm long titles, empty states, and list-heavy states remain readable

Functional verification:
- Theme switching still works
- Custom tab bar still navigates correctly
- Existing page interactions remain intact after style and markup updates

## Risks And Mitigations

Risk:
- The design becomes too subtle and loses the requested identity

Mitigation:
- Keep gold/crimson behavior, disciplined language, and formal title treatment consistent across the system

Risk:
- The design remains too decorative and hurts usability

Mitigation:
- Remove shrine-style framing from the default shell and keep ornament limited to stateful emphasis

Risk:
- Light theme diverges too far from dark theme

Mitigation:
- Reuse the same spacing, structure, and component logic while only changing palette and contrast

## Acceptance Criteria

The redesign is successful when:
- The app clearly feels simpler than the current build
- The Warhammer 40K influence is still recognizable without dominating every surface
- Dark and light themes both feel intentional and cohesive
- The shared shell, tab bar, and page components read as one system
- Core screens remain easy to use in a compact mobile context
