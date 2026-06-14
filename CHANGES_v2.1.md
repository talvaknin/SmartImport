# SmartImport v2.1 — UMI Rebrand + Fixes — Change Summary

Built and verified (`npm run build` succeeds; bundle smoke-tested). Same Supabase
backend, credentials, tables, fields, and business logic — untouched. Deploy
exactly as before: unzip **SmartImport_deploy.zip**, upload `index.html` + the
`assets` folder (+ `.nojekyll`) to the repo, wait 1–2 minutes, hard-refresh.

## What was removed (Phase 1)
- The entire Excel Import feature: page, sidebar + mobile nav item, drag-and-drop UI, preview chips, progress/log, and the parser (`importers.js`).
- The `xlsx` dependency — uninstalled. Bundle shrank ~310 kB (1,879 → 1,567 kB).
- Old `/import` bookmarks no longer crash: any unknown view falls back to the Dashboard.

## Color system → UMI Group (Phases 2 & 9)
- New Tailwind brand tokens: `brand-blue #1F4E9D`, `brand-navy #0B1F3A`, `brand-surface`, `brand-bg #F4F7FB`, `brand-border #D9E2EF`, etc.
- HeroUI `primary` is now **UMI Blue** everywhere — buttons, focus rings, active nav, login CTA, KPI accents, charts.
- Orange is no longer a brand color. Amber now appears **only** as a status color (pending/attention).
- Semantic status colors unchanged in meaning: green=good, blue=in-transit/info, amber=attention, red=problem, gray=closed. Every badge still shows a dot + text, never color alone.

## UI bug-hardening (Phase 3)
- Drawer given an explicit high z-index (wrapper z-60, backdrop z-55) so it can never open behind content or be clipped.
- Add buttons, row clicks, mobile-card taps, dashboard attention items, KPI cards and pipeline stages all route through the same verified open/filter handlers.
- The unsaved-changes guard is now a proper HeroUI confirmation dialog (not the browser `confirm()` popup), with a clear "צא בלי לשמור" action.

## Login redesign (Phase 4)
- Centered premium card (max 420px, 92% on mobile, `rounded-3xl`), navy background with subtle blue gradient glow.
- UMI square logo, larger title, Hebrew tagline + English company name with breathing room (no overlap).
- Labels above 48px inputs, password show/hide toggle, full-width UMI-blue CTA, shake only on failed login, Enter submits.

## Navigation (Phase 5)
- Desktop: navy sidebar, UMI-blue active state, hover effect, logout separated at the bottom; account avatar menu in the top bar.
- Mobile: **bottom tab bar** with the 5 modules (56px tap targets, blue active state); logout lives in the top-bar account menu. No hamburger, no import.

## Tables (Phase 6)
- Mobile now renders **cards** (`RecordCard`) instead of a squeezed table — title, status badge, a few key fields, tap to open. Desktop keeps the full sortable table.
- UMI-blue primary Add button, brand-tint row hover, end-of-row chevron affordance, search/filters/clear/count toolbar, skeleton + empty + error states, 25/page pagination.

## Drawer & forms (Phase 7)
- Desktop side drawer ~640px; **full-screen on mobile**, with sticky header and sticky footer action bar so Save/Cancel are always reachable.
- Grouped read-only view → Edit → grouped form with required-field validation, loading save state, toast on success/failure, confirmed delete, protected unsaved changes.

## Dashboard (Phase 8)
- KPI cards on a responsive `auto-fit minmax(220px)` grid (no more six cramped cards / truncated labels), UMI-blue accents, urgent pulse only for red KPIs.
- Pipeline scrolls horizontally on mobile instead of squeezing; charts stack and use UMI blue.

## Accessibility (Phase 10)
- Visible blue focus rings, ARIA labels on icon-only buttons, semantic button/input elements, 44px+ tap targets on mobile, reduced-motion support retained, `overflow-x` locked to kill horizontal scroll.

## How to test
Use the existing QA plan, with these deltas: confirm there is **no Import** anywhere and `/...SmartImport/` with a junk hash still loads the dashboard; check the login has no overlap at 90–125% zoom; verify mobile shows the bottom tab bar + cards + full-screen drawer; confirm the app reads UMI blue/navy, not orange. `QA-TEST` prefix + cleanup rule unchanged.

## Known limitations / deferred
- HeroUI v2 (not the brand-new v3) — deliberate, for stability.
- The main JS bundle is ~1.57 MB (445 kB gzipped). Fine for an internal tool; if load time ever bothers you, route-level code-splitting is the next optimization.
- Collapsible desktop sidebar (mentioned as "optional" in the brief) not added — say the word if you want it.
